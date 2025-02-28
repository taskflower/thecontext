// src/components/steps/StepResult.tsx

import { Check, X, CheckCircle, AlertCircle, FileText, FormInput, List } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Step } from "@/types";

interface StepResultProps {
  step: Step;
}

export function StepResult({ step }: StepResultProps) {
  if (!step.result) {
    return <div className="text-sm text-muted-foreground italic">No results yet</div>;
  }

  // Render based on step type
  switch (step.type) {
    case 'document':
      return renderDocumentResult(step);
    case 'form':
      return renderFormResult(step);
    case 'checklist':
      return renderChecklistResult(step);
    case 'decision':
      return renderDecisionResult(step);
    default:
      return renderGenericResult(step);
  }
}

function renderDocumentResult(step: Step) {
  const result = step.result;
  const charCount = result.charCount || 0;
  const format = result.format || 'text';
  
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
        {result.content ? (
          <div className="whitespace-pre-wrap font-mono text-xs">
            {result.content.length > 200 
              ? `${result.content.substring(0, 200)}...` 
              : result.content}
          </div>
        ) : (
          <span className="text-muted-foreground italic">Empty document</span>
        )}
      </div>
    </div>
  );
}

function renderFormResult(step: Step) {
  const result = step.result;
  const fields = Object.keys(result || {});
  
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
            <span className="font-mono">{result[field]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderChecklistResult(step: Step) {
  const result = step.result;
  const completedItems = result.completedItems || [];
  const totalItems = (step.config?.items || []).length;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <List size={16} className="text-green-500" />
          <span className="font-medium">Checklist</span>
        </div>
        <Badge>
          {completedItems.length}/{totalItems} Completed
        </Badge>
      </div>
      
      <div className="text-sm">
        <span className="text-muted-foreground">
          Completed at: {new Date(result.completedAt).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

function renderDecisionResult(step: Step) {
  const result = step.result;
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

function renderGenericResult(step: Step) {
  return (
    <div className="text-sm">
      <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-2 rounded-md overflow-auto max-h-32">
        {JSON.stringify(step.result, null, 2)}
      </pre>
    </div>
  );
}