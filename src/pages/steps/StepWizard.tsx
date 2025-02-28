// src/pages/steps/StepWizard.tsx
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Forward } from "lucide-react";
import { useWizardStore } from "@/store/wizardStore";
import { useStepStore } from "@/store/stepStore";
import { useDataStore } from "@/store/dataStore";
import { StepViewer } from "@/pages/stepsPlugins";

const StepWizard = () => {
  const { showWizard, activeTaskId, activeStepId, closeWizard, 
    moveToNextStep, moveToPreviousStep, completeCurrentStep, skipCurrentStep } = useWizardStore();
  const { getTaskSteps } = useStepStore();
  const { tasks } = useDataStore();

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

  return (
    <Dialog open={showWizard} onOpenChange={closeWizard}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {task.title} - Krok {currentStepIndex + 1} z {steps.length}
          </DialogTitle>
        </DialogHeader>

        {/* Step Header/Progress */}
        <div className="flex items-center mt-2 mb-4 border-b pb-4">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center
                  ${step.status === 'completed' ? 'bg-primary/20 text-primary' : 
                    index === currentStepIndex ? 'bg-primary text-white' : 
                    'bg-muted text-muted-foreground'}`
                  }
                >
                  {step.status === 'completed' ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-xs mt-1 text-center w-16 truncate
                  ${index === currentStepIndex ? 'text-primary font-medium' : 'text-muted-foreground'}`
                }>
                  {step.title}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`h-px w-16 mx-1 
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`
                } />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-auto py-4">
          <StepViewer step={currentStep} onComplete={completeCurrentStep} />
        </div>

        {/* Step Footer */}
        <div className="flex justify-between pt-4 border-t mt-2">
          <div>
            {!isFirstStep && (
              <Button 
                variant="outline" 
                onClick={moveToPreviousStep}
                className="flex items-center"
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
              >
                <Forward size={16} className="mr-2" />
                Pomiń
              </Button>
            )}
            
            {!isLastStep ? (
              <Button 
                onClick={moveToNextStep}
                className="flex items-center"
              >
                Następny
                <ArrowRight size={16} className="ml-2" />
              </Button>
            ) : (
              <Button 
                variant="default" 
                onClick={() => completeCurrentStep()}
                className="flex items-center"
              >
                Zakończ
                <Check size={16} className="ml-2" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StepWizard;