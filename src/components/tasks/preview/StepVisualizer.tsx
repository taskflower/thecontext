import { Check } from "lucide-react";
import { cn } from "@/services/utils";

interface StepVisualizerProps {
  step: {
    id: string;
    name: string;
    description: string;
  };
  index: number;
  currentStepIndex: number;
  stepsLength: number;
  stepAnswer?: string;
}

const StepVisualizer = ({ 
  step, 
  index, 
  currentStepIndex,
  stepsLength,
  stepAnswer 
}: StepVisualizerProps) => {
  return (
    <div
      className={cn(
        "relative pl-8 pb-8 group",
        index === stepsLength - 1 && "pb-0"
      )}
    >
      {/* Vertical line */}
      {index !== stepsLength - 1 && (
        <div
          className={cn(
            "absolute left-0 top-2 w-px h-full -ml-px",
            index < currentStepIndex 
              ? "bg-primary"
              : index === currentStepIndex
              ? "bg-gradient-to-b from-primary to-border"
              : "bg-border"
          )}
        />
      )}
      
      {/* Circle indicator */}
      <div
        className={cn(
          "absolute left-0 w-5 h-5 -ml-2.5 rounded-full border-2 flex items-center justify-center bg-background",
          index < currentStepIndex
            ? "border-primary"
            : index === currentStepIndex
            ? "border-primary"
            : "border-border"
        )}
      >
        {index < currentStepIndex ? (
          <Check className="h-3 w-3 text-primary" />
        ) : (
          <span
            className={cn(
              "text-xs font-medium",
              index === currentStepIndex
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {index + 1}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p
          className={cn(
            "text-sm font-medium leading-none",
            index === currentStepIndex ? "text-primary" : "text-foreground"
          )}
        >
          {step.name}
        </p>
        <p className="text-sm text-muted-foreground">
          {step.description}
        </p>
        {stepAnswer && (
          <div className="mt-2 text-sm bg-muted/50 p-3 rounded-lg border">
            <span className="font-medium">Answer:</span> {stepAnswer}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepVisualizer;