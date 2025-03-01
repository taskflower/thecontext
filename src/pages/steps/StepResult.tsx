// src/pages/steps/StepResult.tsx
import { Step } from "@/types";
import { getPlugin } from "@/pages/stepsPlugins/registry";
import { GenericStepResult } from "./GenericStepResult";


interface StepResultProps {
  step: Step;
}

export function StepResult({ step }: StepResultProps) {
  if (!step.result) {
    return <div className="text-sm text-muted-foreground italic">No results yet</div>;
  }

  // Find the plugin for this step type
  const plugin = getPlugin(step.type);
  
  if (plugin && plugin.ResultRenderer) {
    // Use plugin-specific result renderer if available
    const ResultRenderer = plugin.ResultRenderer;
    return <ResultRenderer step={step} />;
  }
  
  // Fall back to generic result rendering
  return <GenericStepResult step={step} />;
}