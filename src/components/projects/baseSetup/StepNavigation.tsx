// StepNavigation.tsx
import React from "react";
import { Button } from "@/components/ui/button";

export const StepNavigation: React.FC<{
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  nextDisabled?: boolean;
}> = ({ currentStep, totalSteps, onNext, onBack, nextDisabled }) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        Back
      </Button>
      <div className="text-sm text-muted-foreground">
        Step {currentStep + 1} of {totalSteps}
      </div>
      <Button onClick={onNext} disabled={nextDisabled}>
        {currentStep === totalSteps - 1 ? "Finish" : "Next"}
      </Button>
    </div>
  );
};