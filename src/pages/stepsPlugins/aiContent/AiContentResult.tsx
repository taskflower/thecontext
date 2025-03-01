// src/pages/stepsPlugins/aiContent/AiContentResult.tsx
import { AiContentResult as AiContentResultType } from './types';
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";

export default function AiContentResult({ step }: ResultRendererProps) {
  const result = step.result as AiContentResultType | undefined;
  if (!result) return null;
  
  const charCount = result.charCount || 0;
  const format = result.format || 'markdown';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-indigo-500" />
          <span className="font-medium">AI-Generated Content</span>
        </div>
        <Badge variant="outline">{format} · {charCount} chars</Badge>
      </div>
      
      <div className="text-sm bg-muted/50 p-2 rounded-md max-h-24 overflow-auto">
        {result.content ? (
          <div className="whitespace-pre-wrap font-mono text-xs">
            {result.content.length > 200 
              ? `${result.content.substring(0, 200)}...` 
              : result.content}
          </div>
        ) : (
          <span className="text-muted-foreground italic">No content</span>
        )}
      </div>
    </div>
  );
}