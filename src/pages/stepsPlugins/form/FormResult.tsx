/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/form/FormResult.tsx
import { FormInput } from "lucide-react";
import { ResultRendererProps } from "../types";

interface ConversationItem {
  role: "assistant" | "user";
  content: string;
}

export default function FormResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  // Support both new conversation format and legacy format for backward compatibility
  let displayData: Record<string, any> = {};
  
  if (result.conversationData) {
    // New format - extract from conversation pairs
    const conversationData = result.conversationData as ConversationItem[];
    
    // Process pairs of items (assistant asks, user answers)
    for (let i = 0; i < conversationData.length; i += 2) {
      if (i + 1 < conversationData.length) {
        const field = conversationData[i].content;
        const value = conversationData[i + 1].content;
        displayData[field] = value;
      }
    }
  } else if (result.rawValues) {
    // Direct access to raw values if available
    displayData = result.rawValues;
  } else {
    // Legacy format - use result directly
    displayData = result;
  }
  
  const fields = Object.keys(displayData);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <FormInput size={16} className="text-purple-500" />
        <span className="font-medium">Form Submission</span>
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm">
        {fields.map(field => (
          <div key={field} className="flex flex-col">
            <span className="text-xs text-muted-foreground">{field}</span>
            <span className="font-mono">{displayData[field]}</span>
          </div>
        ))}
      </div>
      
      {/* Optional debug view for new conversation format */}
      {result.conversationData && (
        <div className="mt-2 pt-2 border-t">
          <div className="text-xs text-muted-foreground">Conversation Format:</div>
          <div className="text-xs font-mono bg-muted p-2 rounded max-h-32 overflow-auto">
            {JSON.stringify(result.conversationData)}
          </div>
        </div>
      )}
    </div>
  );
}