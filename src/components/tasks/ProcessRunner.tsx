import { FC, useState, useCallback } from "react";
import { plugins } from "@/plugins";
import { Template } from "@/types/template";
import { LLMMessage, PluginRuntimeData } from "@/plugins/base";
import StepsPreview from "./preview/StepsPreview";
import InvalidTemplate from "./ProcesRunner/InvalidTemplate";
import StepDisplayCard from "./preview/StepDisplayCard";
import StepDisplayMini from "./preview/StepDisplayMini";
import BottomToolbar from "./ProcesRunner/BottomToolbar";



interface ProcessRunnerProps {
  template: Template;
  onBack: () => void;
  onComplete: () => void;
  onEdit: () => void;
}

interface StepState {
  data: PluginRuntimeData;
  isValid: boolean;
  messages?: LLMMessage[];
}

type ViewMode = "card" | "mini";

export const ProcessRunner: FC<ProcessRunnerProps> = ({
  template,
  onBack,
  onComplete,
  onEdit,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  // Initialize step states
  const initialStepsState: StepState[] = template?.steps?.map((step) => ({
    data: {
      answer: "",
      isConfirmed: false,
      ...(step.config || {}),
      role: "user",
    },
    isValid: false,
  })) || [];

  const [stepsState, setStepsState] = useState<StepState[]>(initialStepsState);

  const handleDataChange = useCallback((newData: PluginRuntimeData) => {
    setStepsState((prev) => {
      const updatedSteps = [...prev];
      const plugin = plugins[template.steps[currentStepIndex].pluginId];
      const messages = plugin.generateMessages(template.steps[currentStepIndex].config, newData);
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        data: newData,
        messages,
        isValid: true,
      };
      return updatedSteps;
    });
  }, [currentStepIndex, template.steps]);

  const handleStatusChange = useCallback((isValid: boolean) => {
    setStepsState((prev) => {
      const updatedSteps = [...prev];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        isValid,
      };
      return updatedSteps;
    });
  }, [currentStepIndex]);

  if (!template?.steps?.length) {
    return <InvalidTemplate onBack={onBack} onEdit={onEdit} />;
  }

  const currentStep = template.steps[currentStepIndex];
  const plugin = plugins[currentStep.pluginId];
  
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

  const StepDisplayComponent = viewMode === "card" ? StepDisplayCard : StepDisplayMini;

  const currentStepState = stepsState[currentStepIndex] || {
    data: {
      answer: "",
      isConfirmed: false,
      role: "user",
    },
    messages: [],
    isValid: false,
  };

  return (
    <div className="relative h-full flex">
      {isPanelOpen && (
        <div className="fixed top-0 left-0 h-full w-full max-w-xl bg-background border-r transition-transform duration-300 ease-in-out z-50">
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
      )}

      <div className="flex-1">
        <div className="max-w-4xl mx-auto flex flex-col p-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {template.name}
            </h2>
          </div>

          <StepDisplayComponent
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

          <BottomToolbar 
            viewMode={viewMode}
            setViewMode={setViewMode}
            isPanelOpen={isPanelOpen}
            togglePanel={togglePanel}
          />
        </div>
      </div>
    </div>
  );
};

export default ProcessRunner;