// src/modules/flow/components/templates/alternative/NavigationButtons.tsx
import React from "react";
import { ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { NavigationButtonsProps } from "../../interfaces";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isProcessing,
  onPrevious,
  onNext,
}) => (
  <div className="flex justify-between items-center p-6 border-t border-border bg-card/50">
    {/* Left side - Previous button */}
    <Button
      onClick={onPrevious}
      disabled={isFirstStep || isProcessing}
      variant="outline"
      className={cn(
        "gap-2 font-medium border-border",
        isFirstStep || isProcessing
          ? "opacity-50 cursor-not-allowed text-muted-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <ArrowLeft className="h-4 w-4" /> Previous
    </Button>

    {/* Right side - Next/Submit button */}
    <Button
      id="next-button"
      onClick={onNext}
      disabled={isProcessing}
      variant="default"
      className={cn(
        "gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90",
        isProcessing && "opacity-80 cursor-wait"
      )}
    >
      {isProcessing ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Processing...
        </>
      ) : isLastStep ? (
        <>
          <CheckCircle className="h-4 w-4" /> Complete
        </>
      ) : (
        <>
          Continue <ArrowRight className="h-4 w-4" />
        </>
      )}
    </Button>
  </div>
);

export default NavigationButtons;