// src/components/APPUI/StepModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";


interface StepModalProps<T> {
  steps: T[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
  renderStepContent?: (step: T) => React.ReactNode;
}

export const StepModal = <T extends Record<string, any>>({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
  renderStepContent,
}: StepModalProps<T>) => {
  const step = steps[currentStep];
  // Force re-render on step change
  React.useEffect(() => {}, [steps, currentStep]);
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{step.label || `Step ${currentStep + 1}`}</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute right-4 top-4"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="my-6">
          {renderStepContent ? (
            renderStepContent(step)
          ) : (
            <div>
              <p>{step.label || `Step ${currentStep + 1}`}</p>
              {step.assistant && (
                <div className="mt-4 p-4 bg-muted rounded-md">
                  {step.assistant}
                </div>
              )}
            </div>
          )}
        </div>
        
        <DialogFooter className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          
          {isLastStep ? (
            <Button
              variant="default"
              onClick={onClose}
            >
              Finish
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={onNext}
            >
              Next
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};