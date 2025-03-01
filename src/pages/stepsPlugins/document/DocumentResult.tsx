// src/pages/stepsPlugins/document/DocumentResult.tsx
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";
import { ConversationItem } from "@/types";

export default function DocumentResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  let content: string = '';
  let format: string = 'text';
  let charCount: number = 0;
  
  // Priority 1: Use step's conversationData if available
  if (step.conversationData && step.conversationData.length >= 6) {
    const valueMap: Record<string, string> = {};
    
    // Process pairs (assistant key, user value)
    for (let i = 0; i < step.conversationData.length; i += 2) {
      if (i + 1 < step.conversationData.length) {
        const key = step.conversationData[i].content;
        const value = step.conversationData[i + 1].content;
        valueMap[key] = value;
      }
    }
    
    content = valueMap.documentContent || '';
    format = valueMap.format || 'text';
    charCount = parseInt(valueMap.charCount || '0', 10) || 0;
  }
  // Priority 2: Use result.conversationData if available
  else if (result.conversationData) {
    // Extract data from conversation format
    const conversationData = result.conversationData as ConversationItem[];
    const valueMap: Record<string, string> = {};
    
    // Process pairs (assistant key, user value)
    for (let i = 0; i < conversationData.length; i += 2) {
      if (i + 1 < conversationData.length) {
        const key = conversationData[i].content;
        const value = conversationData[i + 1].content;
        valueMap[key] = value;
      }
    }
    
    content = valueMap.documentContent || '';
    format = valueMap.format || 'text';
    charCount = parseInt(valueMap.charCount || '0', 10) || 0;
  } 
  // Legacy format (fallback)
  else {
    content = result.content || '';
    format = result.format || 'text';
    charCount = result.charCount || 0;
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-500" />
          <span className="font-medium">Document</span>
        </div>
        <Badge variant="outline">{format} · {charCount} chars</Badge>
      </div>
      
      <div className="text-sm bg-muted/50 p-2 rounded-md max-h-24 overflow-auto">
        {content ? (
          <div className="whitespace-pre-wrap font-mono text-xs">
            {content.length > 200 
              ? `${content.substring(0, 200)}...` 
              : content}
          </div>
        ) : (
          <span className="text-muted-foreground italic">Empty document</span>
        )}
      </div>
    </div>
  );
}