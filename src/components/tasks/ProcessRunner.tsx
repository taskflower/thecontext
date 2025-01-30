import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, PanelRightClose } from "lucide-react";
import { plugins } from "@/plugins";
import { Template } from "@/types/template";
import { LLMMessage, PluginRuntimeData } from "@/plugins/base";
import StepsPreview from "./preview/StepsPreview";
import { Separator } from "@/components/ui/separator";
import InvalidTemplate from "./ProcesRunner/InvalidTemplate";
import StepDisplay from "./preview/StepDisplay1";

interface ProcessRunnerProps {
  template: Template;
  onBack: () => void;
  onComplete: () => void;
}

interface StepState {
  data: PluginRuntimeData;
  isValid: boolean;
  messages?: LLMMessage[];
}

export const ProcessRunner: FC<ProcessRunnerProps> = ({
  template,
  onBack,
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const [stepsState, setStepsState] = useState<StepState[]>(() => {
    if (!template?.steps) return [];

    return template.steps.map((step) => {
      const plugin = plugins[step.pluginId];
      if (plugin) {
        return {
          data: {
            answer: "",
            isConfirmed: false,
            ...(step.config || {}),
            role: "user",
          },
          isValid: false,
        };
      }
      return {
        data: {},
        isValid: false,
      };
    });
  });

  if (!template?.steps?.length) {
    return <InvalidTemplate onBack={onBack} />;
  }

  const currentStep = template.steps[currentStepIndex];
  const plugin = plugins[currentStep.pluginId];
  const currentStepState = stepsState[currentStepIndex] || {
    data: {
      answer: "",
      isConfirmed: false,
      role: "user",
    },
    messages: [],
    isValid: false,
  };

  const handleDataChange = (newData: PluginRuntimeData) => {
    setStepsState((prev) => {
      const updatedSteps = [...prev];
      const messages = plugin.generateMessages(currentStep.config, newData);
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        data: newData,
        messages,
        isValid: true,
      };
      return updatedSteps;
    });
  };

  const handleStatusChange = (isValid: boolean) => {
    setStepsState((prev) => {
      const updatedSteps = [...prev];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        isValid,
      };
      return updatedSteps;
    });
  };

  const handleNext = () => {
    if (currentStepIndex === template.steps.length - 1) {
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStepIndex === 0) {
      onBack();
    } else {
      setCurrentStepIndex((prev) => prev - 1);
    }
  };

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  return (
    <div className="relative h-full flex">
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-xl bg-background border-r transition-transform duration-300 ease-in-out z-50 ${
          isPanelOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <StepsPreview
            steps={template.steps}
            stepsState={stepsState}
            currentStepIndex={currentStepIndex}
            isPanelOpen={isPanelOpen}
            onTogglePanel={togglePanel}
          />
        </div>
      </div>

      <div className="flex-1">
        <div className="max-w-4xl mx-auto flex flex-col p-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {template.name}
            </h2>
            {/* <p className="text-muted-foreground">
            Create or modify task template details and steps
          </p> */}
          </div>

          <StepDisplay
            template={template}
            currentStep={currentStep}
            currentStepIndex={currentStepIndex}
            plugin={plugin}
            stepState={currentStepState}
            stepsState={stepsState}
            onBack={handleBack}
            onNext={handleNext}
            onDataChange={handleDataChange}
            onStatusChange={handleStatusChange}
          />
          <div className="fixed bottom-0 right-0 w-full bg-white">
            <Separator />
            <div className="p-3 flex justify-end">
              <Button variant="outline" onClick={togglePanel}>
                {isPanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
                {isPanelOpen ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessRunner;
