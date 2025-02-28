/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/steps/components/StepFooter.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, Forward } from "lucide-react";

interface StepFooterProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSkip?: () => void;
  onComplete: (result?: Record<string, any>) => void;
}

const StepFooter: React.FC<StepFooterProps> = ({ 
  onPrevious, 
  onNext, 
  onSkip, 
  onComplete 
}) => {
  return (
    <div className="flex justify-between pt-4 border-t mt-2">
      <div>
        {onPrevious && (
          <Button 
            variant="outline" 
            onClick={onPrevious}
            className="flex items-center"
          >
            <ArrowLeft size={16} className="mr-2" />
            Previous
          </Button>
        )}
      </div>
      
      <div className="flex gap-2">
        {onSkip && (
          <Button 
            variant="ghost" 
            onClick={onSkip}
            className="flex items-center"
          >
            <Forward size={16} className="mr-2" />
            Skip
          </Button>
        )}
        
        {onNext ? (
          <Button 
            onClick={onNext}
            className="flex items-center"
          >
            Next
            <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button 
            variant="default" 
            onClick={() => onComplete()}
            className="flex items-center"
          >
            Complete
            <Check size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StepFooter;