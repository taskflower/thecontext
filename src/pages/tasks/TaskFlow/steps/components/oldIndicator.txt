// StepIndicator.tsx
import React from "react";

export const StepIndicator: React.FC<{
  currentStep: number;
  steps: string[];
}> = ({ currentStep, steps }) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center ${index <= currentStep ? "text-primary" : "text-muted-foreground"}`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 border ${
                index < currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : index === currentStep 
                  ? "border-primary text-primary" 
                  : "border-muted-foreground text-muted-foreground"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-sm">{step}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 relative">
        <div className="absolute top-1/2 h-px w-full bg-muted-foreground/20" />
        <div 
          className="absolute top-1/2 h-px bg-primary transition-all" 
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};