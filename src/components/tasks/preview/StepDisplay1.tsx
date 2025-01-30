import { FC } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";
import { Template } from "@/types/template";
import { PluginRuntimeData, LLMMessage } from "@/plugins/base";
import { plugins } from "@/plugins";


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
    <div className="flex flex-col w-full max-w-4xl mx-auto border-r border-gray-100 border-dashed min-h-[calc(100vh-20rem)]">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-md text-muted-foreground">
            {currentStep.name}
          </h2>
          <span className="text-md text-muted-foreground">
            {currentStepIndex + 1} of {template.steps.length}
          </span>
        </div>
        
        {currentStep.description && (
          <p className="text-muted-foreground">
            {currentStep.description}
          </p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 mb-12 grid items-end">
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
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center space-x-2 mb-8">
        {template.steps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full ${
              index === currentStepIndex
                ? "bg-primary"
                : index < currentStepIndex
                ? "bg-primary/60"
                : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-12">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!stepState.isValid}
          className="flex items-center"
        >
          {isLastStep ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete
            </>
          ) : (
            <>
              Continue
              <ChevronRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepDisplay;