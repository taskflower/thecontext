/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/steps/StepWizard.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Forward,
  AlertCircle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StepViewer } from "@/pages/stepsPlugins";
import { validateStep } from "@/pages/stepsPlugins/validation";
import { triggerPluginAction } from "@/pages/stepsPlugins/pluginHandlers";
import { useStepStore, useTaskStore, useWizardStore } from "@/store";
import { Button } from "@/components/ui";
import taskService from "../tasks/services/TaskService";

const StepWizard = () => {
  // Store hooks
  const {
    showWizard,
    activeTaskId,
    activeStepId,
    closeWizard,
    moveToNextStep,
    moveToPreviousStep,
    completeCurrentStep,
    skipCurrentStep,
  } = useWizardStore();

  const { getTaskSteps } = useStepStore();
  const { tasks } = useTaskStore();

  // UI state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // References
  const stepContentRef = useRef<HTMLDivElement>(null);

  // Data variables
  const task = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const steps = activeTaskId
    ? getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order)
    : [];
  const currentStep = activeStepId
    ? steps.find((s) => s.id === activeStepId)
    : null;
  const currentStepIndex = currentStep
    ? steps.findIndex((s) => s.id === activeStepId)
    : -1;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  // Check task executability on mount
  useEffect(() => {
    if (showWizard && task) {
      const { isExecutable, errorMessage } = taskService.canExecuteTask(
        task,
        steps
      );

      if (!isExecutable) {
        alert(errorMessage);
        closeWizard();
      }
    }
  }, [showWizard, task, steps, closeWizard]);

  // Handle step completion from plugin
  const handleStepComplete = (result?: Record<string, any>) => {
    setIsProcessing(false);
    completeCurrentStep(result);
  };

  // Handle "Next" button - triggers plugin action
  const handleNext = () => {
    if (!currentStep) {
      return;
    }

    // If step is already completed, just move to the next one
    if (currentStep.status === "completed") {
      moveToNextStep();
      return;
    }

    // Validate step
    const validationResult = validateStep(currentStep);
    if (!validationResult.isValid) {
      const errorMsg =
        validationResult.errorMessage || "Please complete all required fields";
      setValidationError(errorMsg);
      return;
    }

    setValidationError(null);
    setIsProcessing(true);

    console.log(
      `StepWizard: Triggering plugin action for step ${currentStep.id}`
    );

    // Trigger plugin action through handler system
    const success = triggerPluginAction(currentStep.id);

    if (!success) {
      // If no handler was found, show message
      setValidationError(
        "Cannot complete this step automatically. Use the button in the plugin."
      );
      setIsProcessing(false);
    }
  };

  // Early return if we don't have the necessary data
  if (!showWizard || !task || !currentStep) {
    return null;
  }

  return (
    <Dialog
      open={showWizard}
      onOpenChange={(open) => {
        if (!open) closeWizard();
      }}
    >
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {task.title} - Krok {currentStepIndex + 1} z {steps.length}
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="flex items-center mt-2 mb-4 border-b pb-4 overflow-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      step.status === "completed"
                        ? "bg-primary/20 text-primary"
                        : index === currentStepIndex
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step.status === "completed" ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 text-center w-16 truncate
                    ${
                      index === currentStepIndex
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`h-px w-16 mx-1 flex-shrink-0
                    ${index < currentStepIndex ? "bg-primary" : "bg-muted"}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Validation error */}
        {validationError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}

        {/* Step content */}
        <div className="flex-1 overflow-auto py-4" ref={stepContentRef}>
          <StepViewer step={currentStep} onComplete={handleStepComplete} />
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t mt-2">
          <div>
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={moveToPreviousStep}
                className="flex items-center"
                disabled={isProcessing}
              >
                <ArrowLeft size={16} className="mr-2" />
                Poprzedni
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep.status !== "completed" && (
              <Button
                variant="ghost"
                onClick={skipCurrentStep}
                className="flex items-center"
                disabled={isProcessing}
              >
                <Forward size={16} className="mr-2" />
                Pomiń
              </Button>
            )}

            <Button
              onClick={handleNext}
              className="flex items-center"
              disabled={isProcessing}
              data-testid="next-step-button"
            >
              {isProcessing ? (
                "Przetwarzanie..."
              ) : isLastStep ? (
                <>
                  Zakończ
                  <Check size={16} className="ml-2" />
                </>
              ) : (
                <>
                  Następny
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepWizard;
