/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/StepViewer.tsx
import { Step, ConversationItem } from "@/types";
import { getPlugin } from "./registry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface StepViewerProps {
  step: Step;
  onComplete: (result?: Record<string, any>) => void;
}

export function StepViewer({ step, onComplete }: StepViewerProps) {
  const plugin = getPlugin(step.type);

  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Plugin not found: {step.type}</AlertDescription>
      </Alert>
    );
  }

  // Wrapper for onComplete that handles conversationData
  const handleComplete = (result?: Record<string, any>, conversationData?: ConversationItem[]) => {
    // If conversationData is provided, update the step with it
    if (conversationData && conversationData.length > 0) {
      onComplete({
        ...result,
        conversationData
      });
    } else {
      onComplete(result);
    }
  };

  return <plugin.Viewer step={step} onComplete={handleComplete} />;
}