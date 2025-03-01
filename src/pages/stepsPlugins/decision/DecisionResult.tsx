// src/pages/stepsPlugins/decision/DecisionResult.tsx
import { Check, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";

interface ConversationItem {
  role: "assistant" | "user";
  content: string;
}

export default function DecisionResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  let decision: string;
  let decisionLabel: string;
  let comment: string;
  
  // Handle both new conversation format and legacy format
  if (result.conversationData) {
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
  } else if (result.rawDecision) {
    // Direct access if available
    decision = result.rawDecision.decision;
    decisionLabel = result.rawDecision.decisionLabel;
    comment = result.rawDecision.comment;
  } else {
    // Legacy format
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