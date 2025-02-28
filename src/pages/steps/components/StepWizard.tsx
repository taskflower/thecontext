/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/steps/components/StepWizard.tsx
import React from "react";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StepHeader from "./StepHeader";
import StepFooter from "./StepFooter";
import { useDataStore, useUIStore } from "../../../../../store";
import PluginLoader from "../../stepsPlugins/PluginLoader";


const StepWizard: React.FC = () => {
  const {
    showStepWizard,
    activeTaskId,
    activeStepId,
    moveToNextStep,
    moveToPreviousStep,
    toggleStepWizard
  } = useUIStore();
  const { tasks, completeStep, skipStep, getTaskSteps } = useDataStore();

  // If there's no active task or step, don't render anything
  if (!activeTaskId || !activeStepId) return null;

  const task = tasks.find((t) => t.id === activeTaskId);
  if (!task) return null;

  const steps = getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order);
  const currentStep = steps.find((s) => s.id === activeStepId);

  if (!currentStep) return null;

  const currentStepIndex = steps.findIndex((s) => s.id === activeStepId);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const handleClose = () => {
    toggleStepWizard();
  };

  const handleNext = () => {
    moveToNextStep(activeTaskId);
  };

  const handlePrev = () => {
    moveToPreviousStep(activeTaskId);
  };

  const handleComplete = (result?: Record<string, any>) => {
    completeStep(activeStepId, result);
    
    // Automatically move to next step if not the last one
    if (!isLastStep) {
      moveToNextStep(activeTaskId);
    } else {
      // Close the wizard if it's the last step
      toggleStepWizard();
    }
  };

  const handleSkip = () => {
    skipStep(activeStepId);
    
    // Move to next step after skipping
    if (!isLastStep) {
      moveToNextStep(activeTaskId);
    } else {
      // Close the wizard if it's the last step
      toggleStepWizard();
    }
  };

  return (
    <Dialog open={showStepWizard} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {task.title} - Step {currentStepIndex + 1} of {steps.length}
          </DialogTitle>
        </DialogHeader>

        <StepHeader steps={steps} currentStepIndex={currentStepIndex} />

        <div className="flex-1 overflow-auto py-4">
          <PluginLoader step={currentStep} onComplete={handleComplete} />
        </div>

        <StepFooter
          onPrevious={isFirstStep ? undefined : handlePrev}
          onNext={isLastStep ? undefined : handleNext}
          onSkip={currentStep.status !== "completed" ? handleSkip : undefined}
          onComplete={handleComplete}
        />
      </DialogContent>
    </Dialog>
  );
};

export default StepWizard;