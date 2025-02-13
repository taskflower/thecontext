import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { PanelRightOpen, PanelRightClose, LayoutGrid, List } from "lucide-react";
import { plugins } from "@/plugins";
import { Template } from "@/types/template";
import { LLMMessage, PluginRuntimeData } from "@/plugins/base";
import StepsPreview from "./preview/StepsPreview";
import { Separator } from "@/components/ui/separator";
import InvalidTemplate from "./ProcesRunner/InvalidTemplate";
import StepDisplayCard from "./preview/StepDisplayCard";
import StepDisplayMini from "./preview/StepDisplayMini";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Trans } from "@lingui/macro";

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
    return <InvalidTemplate onBack={onBack} onEdit={onEdit} />;
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

  const StepDisplayComponent = viewMode === "card" ? StepDisplayCard : StepDisplayMini;

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

          <div className="fixed bottom-0 right-0 w-full bg-zinc-50 z-20">
            <Separator />
            <div className="p-3 flex justify-end items-center gap-3">
              <ToggleGroup
                variant={"outline"}
                type="single"
                value={viewMode}
                onValueChange={(value: string) => setViewMode(value as ViewMode)}
              >
                <ToggleGroupItem value="card" aria-label="Card View">
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  <Trans>Card View</Trans>
                </ToggleGroupItem>
                <ToggleGroupItem value="mini" aria-label="Mini View">
                  <List className="h-4 w-4 mr-2" />
                  <Trans>Mini View</Trans>
                </ToggleGroupItem>
              </ToggleGroup>

              <Button variant="outline" onClick={togglePanel}>
                {isPanelOpen ? <PanelRightClose /> : <PanelRightOpen />}
                {isPanelOpen ? (
                  <Trans>Hide Preview</Trans>
                ) : (
                  <Trans>Show Preview</Trans>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessRunner;
