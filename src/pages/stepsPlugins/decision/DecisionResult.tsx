// src/pages/stepsPlugins/decision/DecisionResult.tsx
import { Check, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";
import { ConversationItem } from "@/types";

export default function DecisionResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  let decision: string;
  let decisionLabel: string;
  let comment: string;
  
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
    
    decision = valueMap.decision || '';
    decisionLabel = valueMap.decisionLabel || '';
    comment = valueMap.comment || '';
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
    
    decision = valueMap.decision || '';
    decisionLabel = valueMap.decisionLabel || '';
    comment = valueMap.comment || '';
  } 
  // Priority 3: Direct access to rawDecision if available
  else if (result.rawDecision) {
    decision = result.rawDecision.decision;
    decisionLabel = result.rawDecision.decisionLabel;
    comment = result.rawDecision.comment;
  } 
  // Legacy format (fallback)
  else {
    decision = result.decision;
    decisionLabel = result.decisionLabel;
    comment = result.comment;
  }
  
  const isApproved = decision === 'approve';
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isApproved ? (
            <CheckCircle size={16} className="text-green-500" />
          ) : (
            <AlertCircle size={16} className="text-red-500" />
          )}
          <span className="font-medium">Decision: {decisionLabel}</span>
        </div>
        <Badge variant={isApproved ? "default" : "destructive"}>
          {isApproved ? <Check size={12} /> : <X size={12} />}
        </Badge>
      </div>
      
      {comment && (
        <div className="text-sm bg-muted/50 p-2 rounded-md">
          <div className="italic text-muted-foreground">Comment:</div>
          <div>{comment}</div>
        </div>
      )}
    </div>
  );
}