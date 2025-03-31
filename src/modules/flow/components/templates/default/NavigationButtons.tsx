// src/modules/flow/components/templates/default/NavigationButtons.tsx
import React from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { NavigationButtonsProps } from "../../interfaces";
import { cn } from "@/utils/utils";
import { Button } from "@/components/ui/button";

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ 
  isFirstStep, 
  isLastStep, 
  isProcessing, 
  onPrevious, 
  onNext 
}) => (
  <div className="flex justify-between p-4 border-t border-border bg-muted/20">
    <Button
      onClick={onPrevious}
      disabled={isFirstStep || isProcessing}
      variant="outline"
      className={cn(
        "gap-2 font-medium",
        isFirstStep || isProcessing
          ? "opacity-50 cursor-not-allowed border-border text-muted-foreground"
          : "border-border text-primary hover:bg-accent hover:text-accent-foreground hover:border-input"
      )}
    >
      <ArrowLeft className="h-4 w-4" /> Previous
    </Button>

    <Button
      onClick={onNext}
      disabled={isProcessing}
      variant="default"
      className={cn(
        "gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90",
        isProcessing && "opacity-70 cursor-wait"
      )}
    >
      {isProcessing ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {isLastStep ? "Saving..." : "Processing..."}
        </span>
      ) : (
        <>
          {isLastStep ? "Finish" : "Next"}{" "}
          {!isLastStep && <ArrowRight className="h-4 w-4" />}
        </>
      )}
    </Button>
  </div>
);

export default NavigationButtons;