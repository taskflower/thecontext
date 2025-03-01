/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/form/FormResult.tsx
import { FormInput } from "lucide-react";
import { ResultRendererProps } from "../types";
import { ConversationItem } from "@/types";

export default function FormResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  // Support both direct conversationData and legacy format
  let displayData: Record<string, any> = {};
  
  // Primary source: check if conversationData exists in the step
  if (step.conversationData && step.conversationData.length > 0) {
    // Extract data from conversation pairs in the step
    const conversationData = step.conversationData;
    
    // Process pairs of items (assistant asks, user answers)
    for (let i = 0; i < conversationData.length; i += 2) {
      if (i + 1 < conversationData.length) {
        const field = conversationData[i].content;
        const value = conversationData[i + 1].content;
        displayData[field] = value;
      }
    }
  }
  // Secondary source: check if conversationData exists in the result
  else if (result.conversationData) {
    // Extract from conversation pairs in result
    const conversationData = result.conversationData as ConversationItem[];
    
    // Process pairs of items (assistant asks, user answers)
    for (let i = 0; i < conversationData.length; i += 2) {
      if (i + 1 < conversationData.length) {
        const field = conversationData[i].content;
        const value = conversationData[i + 1].content;
        displayData[field] = value;
      }
    }
  } 
  // Fallback: use raw values if available
  else if (result.rawValues) {
    displayData = result.rawValues;
  } 
  // Last resort: use result directly (legacy format)
  else {
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
    </div>
  );
}