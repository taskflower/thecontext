// src/modules/flow/components/templates/alternative/NavigationButtons.tsx
import React from "react";
import { NavigationButtonsProps } from "../../interfaces";
import { cn } from "@/utils/utils";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isProcessing,
  onPrevious,
  onNext,
}) => (
  <div className="flex justify-between p-4 border-t border-border">
    <button
      onClick={onPrevious}
      disabled={isFirstStep || isProcessing}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isFirstStep || isProcessing
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      )}
    >
      ← Poprzedni
    </button>

    <button
      onClick={onNext}
      disabled={isProcessing}
      className={cn(
        "px-4 py-2 rounded-md text-sm font-medium transition-colors",
        isProcessing
          ? "bg-primary/70 text-primary-foreground cursor-wait"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      )}
    >
      {isLastStep ? "Zakończ" : "Następny →"}
    </button>
  </div>
);

export default NavigationButtons;