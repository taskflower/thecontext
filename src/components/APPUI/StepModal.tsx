// src/components/APPUI/StepModal.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from "react";
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
  // Moved useEffect before any conditional returns
  useEffect(() => {}, [steps, currentStep]);
  
  // Conditional check after hooks
  if (!steps || steps.length === 0 || currentStep < 0 || currentStep >= steps.length) {
    return null;
  }
  
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  // Added safe access to label with fallback
  const stepLabel = step?.label || `Step ${currentStep + 1}`;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{stepLabel}</DialogTitle>
        </DialogHeader>
        
        <div className="my-6">
          {renderStepContent ? (
            renderStepContent(step)
          ) : (
            <div>
              <p>{stepLabel}</p>
              {step?.assistant && (
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