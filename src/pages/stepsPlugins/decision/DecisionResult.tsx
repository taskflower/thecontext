// src/pages/stepsPlugins/decision/DecisionResult.tsx
import { Check, X, CheckCircle, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ResultRendererProps } from "../types";

export default function DecisionResult({ step }: ResultRendererProps) {
  const result = step.result;
  if (!result) return null;
  
  const decision = result.decision;
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
          <span className="font-medium">Decision: {result.decisionLabel}</span>
        </div>
        <Badge variant={isApproved ? "default" : "destructive"}>
          {isApproved ? <Check size={12} /> : <X size={12} />}
        </Badge>
      </div>
      
      {result.comment && (
        <div className="text-sm bg-muted/50 p-2 rounded-md">
          <div className="italic text-muted-foreground">Comment:</div>
          <div>{result.comment}</div>
        </div>
      )}
    </div>
  );
}