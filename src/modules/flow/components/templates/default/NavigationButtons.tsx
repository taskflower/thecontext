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
      {isLastStep ? "Finish" : "Next"}{" "}
      {!isLastStep && <ArrowRight className="h-4 w-4" />}
    </Button>
  </div>
);

export default NavigationButtons;