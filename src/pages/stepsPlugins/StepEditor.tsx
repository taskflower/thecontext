// src/pages/stepsPlugins/StepEditor.tsx
import { Step } from "@/types";
import { getPlugin } from "./registry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StepEditorProps {
  step: Step;
  onChange: (updates: Partial<Step>) => void;
}

export function StepEditor({ step, onChange }: StepEditorProps) {
  const plugin = getPlugin(step.type);
  
  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Plugin not found: {step.type}</AlertDescription>
      </Alert>
    );
  }
  
  return <plugin.Editor step={step} onChange={onChange} />;
}