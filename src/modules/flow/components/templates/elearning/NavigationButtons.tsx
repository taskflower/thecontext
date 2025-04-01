// src/modules/flow/components/templates/elearning/NavigationButtons.tsx
import React from "react";
import { CheckCircle } from "lucide-react";
import { NavigationButtonsProps } from "../../interfaces";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/utils";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isProcessing,
  onPrevious,
  onNext,
}) => (
  <div className="border-t border-border p-4 bg-background flex flex-col items-center">
    {/* Primary action button */}
    <Button
      onClick={onNext}
      disabled={isProcessing}
      className={cn(
        "w-full max-w-md h-12 mb-2 font-bold text-base rounded-xl transition-all",
        isProcessing
          ? "bg-muted text-muted-foreground cursor-wait"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {isProcessing ? (
        <div className="flex items-center justify-center space-x-2">
          <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          <span>Checking...</span>
        </div>
      ) : isLastStep ? (
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-5 w-5" />
          <span>Complete Lesson</span>
        </div>
      ) : (
        <span>Check Answer</span>
      )}
    </Button>

    {/* Skip/Previous button - smaller and less prominent */}
    {!isLastStep && (
      <Button
        onClick={onPrevious}
        disabled={isFirstStep || isProcessing}
        variant="ghost"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {isFirstStep ? "Skip this question" : "Previous question"}
      </Button>
    )}
  </div>
);

export default NavigationButtons;