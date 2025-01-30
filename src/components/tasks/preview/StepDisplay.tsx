import { FC } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Template } from "@/types/template";
import { PluginRuntimeData, LLMMessage } from "@/plugins/base";
import { plugins } from "@/plugins";

// Define Plugin type based on the structure of plugins
type Plugin = typeof plugins[keyof typeof plugins];

interface StepDisplayProps {
  template: Template;
  currentStep: Template["steps"][0];
  currentStepIndex: number;
  plugin: Plugin;
  stepState: {
    data: PluginRuntimeData;
    isValid: boolean;
    messages?: LLMMessage[];
  };
  stepsState: Array<{
    data: PluginRuntimeData;
    messages?: LLMMessage[];
  }>;
  onBack: () => void;
  onNext: () => void;
  onDataChange: (data: PluginRuntimeData) => void;
  onStatusChange: (isValid: boolean) => void;
}

export const StepDisplay: FC<StepDisplayProps> = ({
  template,
  currentStep,
  currentStepIndex,
  plugin,
  stepState,
  stepsState,
  onBack,
  onNext,
  onDataChange,
  onStatusChange,
}) => {
  const isLastStep = currentStepIndex === template.steps.length - 1;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>
              Step {currentStepIndex + 1}: {currentStep.name}
            </CardTitle>
            <CardDescription>
              {currentStep.description || "No description provided"}
            </CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Step {currentStepIndex + 1} of {template.steps.length}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {plugin?.RuntimeComponent && (
            <plugin.RuntimeComponent
              config={currentStep.config}
              data={stepState.data}
              onDataChange={onDataChange}
              onStatusChange={onStatusChange}
              context={{
                currentStep: currentStepIndex + 1,
                totalSteps: template.steps.length,
                previousSteps: stepsState.slice(0, currentStepIndex),
              }}
            />
          )}

          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={onBack}
            >
              <ChevronLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button
              onClick={onNext}
              disabled={!stepState.isValid}
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" /> Complete
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StepDisplay;