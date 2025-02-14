import { Check, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/services/utils";
import { useState } from "react";

interface Message {
  role: string;
  content: string;
}

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
  messages?: Message[];
}

const StepVisualizer = ({
  step,
  index,
  currentStepIndex,
  stepsLength,
  stepAnswer,
  messages = [],
}: StepVisualizerProps) => {
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const toggleMessages = () => setIsMessagesOpen(!isMessagesOpen);

  const truncateMessage = (message: string) => {
    return message.length > 100 ? `${message.slice(0, 100)}...` : message;
  };

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
          "absolute left-0 w-6 h-6 -ml-3 rounded-full border-2 flex items-center justify-center bg-background",
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
        <div className="flex items-center gap-2 justify-between">
          <p
            className={cn(
              "text-sm font-medium leading-none p-1",
              index === currentStepIndex ? "text-primary" : "text-foreground"
            )}
          >
            {step.name}
          </p>
          {messages && messages.length > 0 && (
            <button
              onClick={toggleMessages}
              className="p-1 rounded inline-flex bg-gray-100 items-center gap-1 text-xs text-gray-900 hover:text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Generated messages</span>
              {isMessagesOpen ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{step.description}</p>
        {stepAnswer && (
          <div className="mt-2 text-sm bg-muted/50 p-3 rounded-lg border">
            <span className="font-medium">Answer:</span> {stepAnswer}
          </div>
        )}
        {isMessagesOpen && messages && messages.length > 0 && (
          <div className="mt-2 space-y-2">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`${
                  message.role === "user" && "border-green-400"
                } text-sm p-2 rounded-lg bg-muted/30 border`}
              >
                <span className="font-medium capitalize text-xs text-muted-foreground">
                  {message.role}:
                </span>
                <p className="mt-1">{truncateMessage(message.content)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepVisualizer;
