// src/pages/tasks/TaskFlow/steps/components/StepHeader.tsx
import React from "react";
import { Step } from "../../types";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface StepHeaderProps {
  steps: Step[];
  currentStepIndex: number;
}

const StepHeader: React.FC<StepHeaderProps> = ({ steps, currentStepIndex }) => {
  return (
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
                <CheckCircle size={16} />
              ) : step.status === 'skipped' ? (
                <Clock size={16} />
              ) : (
                <Circle size={16} />
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
  );
};

export default StepHeader;