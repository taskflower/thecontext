import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  PanelRightOpen,
  PanelRightClose,
} from "lucide-react";
import { plugins } from "@/plugins";
import { Template } from "@/types/template";
import { PluginRuntimeData } from "@/plugins/base";
import StepsPreview from "./preview/StepsPreview";
import { Separator } from "../ui/separator";
import InvalidTemplate from "./ProcesRunner/InvalidTemplate";

interface ProcessRunnerProps {
  template: Template;
  onBack: () => void;
  onComplete: () => void;
}

interface StepState {
  data: PluginRuntimeData;
  isValid: boolean;
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

  const handleDataChange = (newData: PluginRuntimeData) => {
    setStepsState((prev) => {
      const updatedSteps = [...prev];
      updatedSteps[currentStepIndex] = {
        ...updatedSteps[currentStepIndex],
        data: newData,
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
    isValid: false,
  };

  const handleNext = () => {
    if (currentStepIndex === template.steps.length - 1) {
      onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const togglePanel = () => setIsPanelOpen(!isPanelOpen);

  return (
    <div className="relative h-full flex">
      <div
        className={`fixed top-0 left-0 h-full w-96 bg-background border-r transition-transform duration-300 ease-in-out z-50 ${
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
        <div className="max-w-4xl mx-auto flex flex-col space-y-8 p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{template.name}</h2>
            <button>Back to....</button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>
                Step {currentStepIndex + 1}: {currentStep.name}
              </CardTitle>
              <CardDescription>
                {currentStep.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {plugin?.RuntimeComponent && (
                <plugin.RuntimeComponent
                  config={currentStep.config}
                  data={currentStepState.data}
                  onDataChange={handleDataChange}
                  onStatusChange={handleStatusChange}
                  context={{
                    currentStep: currentStepIndex + 1,
                    totalSteps: template.steps.length,
                    previousSteps: stepsState
                      .slice(0, currentStepIndex)
                      .map((s) => s.data),
                  }}
                />
              )}

              <div className="flex justify-between pt-6 border-t mt-6">
                <Button
                  variant="outline"
                  onClick={() =>
                    currentStepIndex === 0
                      ? onBack()
                      : setCurrentStepIndex((prev) => prev - 1)
                  }
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!currentStepState.isValid}
                >
                  {currentStepIndex === template.steps.length - 1 ? (
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
            </CardContent>
          </Card>
          <Separator />
          <Button variant="outline" onClick={togglePanel}>
            {isPanelOpen ? <PanelRightClose /> : <PanelRightOpen />}{" "}
            {isPanelOpen ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProcessRunner;
