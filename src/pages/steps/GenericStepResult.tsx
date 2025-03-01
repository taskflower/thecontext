// src/pages/steps/GenericStepResult.tsx
import { Step } from "@/types";

interface GenericStepResultProps {
  step: Step;
}

export function GenericStepResult({ step }: GenericStepResultProps) {
  return (
    <div className="text-sm">
      <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 p-2 rounded-md overflow-auto max-h-32">
        {JSON.stringify(step.result, null, 2)}
      </pre>
    </div>
  );
}