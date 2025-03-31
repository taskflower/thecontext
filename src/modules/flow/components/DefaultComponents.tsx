// src/modules/flow/components/DefaultComponents.tsx
import React from "react";
import { Bot, X, ArrowLeft, ArrowRight,  Layers } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAppStore } from "@/modules/store";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";

export interface DefaultHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  nodeName?: string;
  onClose: () => void;
}

export const DefaultHeader: React.FC<DefaultHeaderProps> = ({
  currentStepIndex,
  totalSteps,
  nodeName,
  onClose,
}) => {
  // Get current workspace information from store
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();

  return (<>
    <CardHeader className="bg-card text-card-foreground border-b border-border pb-6">
      {/* Workspace info section */}
      {currentWorkspace && (
        <div className="mb-2 flex items-center justify-between">
          <div>
            <Badge
              variant="outline"
              className="text-xs font-semibold border-border bg-accent text-accent-foreground mb-2"
            >
              {currentWorkspace.title}
            </Badge>
            {currentWorkspace.description && (
              <CardDescription className="text-muted-foreground text-xs max-w-md">
                {currentWorkspace.description}
              </CardDescription>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Step info section */}
      <div className="flex items-center space-x-2 mt-2">
        <Badge
          variant="secondary"
          className="bg-secondary text-secondary-foreground hover:bg-secondary"
        >
          {currentStepIndex + 1}/{totalSteps}
        </Badge>
        <CardTitle className="text-xl font-bold text-primary tracking-tight">
          {nodeName || `Step ${currentStepIndex + 1}`}
        </CardTitle>
      </div>
    </CardHeader>
    <div className="flex-1"></div></>
  );
};

export interface DefaultAssistantMessageProps {
  message?: string;
}

export const DefaultAssistantMessage: React.FC<
  DefaultAssistantMessageProps
> = ({ message }) => (
  <div className="flex items-start gap-4 mb-6">
    <div className="h-10 w-10 rounded-full flex items-center justify-center border border-border bg-secondary text-secondary-foreground flex-shrink-0 shadow-sm">
      <Bot className="h-5 w-5" />
    </div>
    <div className="flex-1 space-y-2 ">
      <div className="flex items-center">
        <span className="text-sm font-semibold text-primary">Assistant</span>
      </div>
      <Card className="bg-card/50 border-border text-card-foreground shadow-md max-h-40 overflow-y-scroll">
        <CardContent className="p-4">
          {message || "Waiting for your response..."}
        </CardContent>
      </Card>
    </div>
  </div>
);

export interface DefaultUserInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DefaultUserInput: React.FC<DefaultUserInputProps> = ({
  value,
  onChange,
  placeholder = "Type your message...",
}) => (
  <div className="mt-6 space-y-2">
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium text-primary">Your response:</span>
    </div>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 bg-background border-input rounded-lg text-foreground focus-visible:ring-ring focus-visible:ring-offset-card resize-none"
      rows={4}
    />
  </div>
);

export interface DefaultNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const DefaultNavigationButtons: React.FC<
  DefaultNavigationButtonsProps
> = ({ isFirstStep, isLastStep, isProcessing, onPrevious, onNext }) => (
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

export interface DefaultContextUpdateInfoProps {
  contextKey: string | undefined;
  isVisible: boolean;
}

export const DefaultContextUpdateInfo: React.FC<
  DefaultContextUpdateInfoProps
> = ({ contextKey, isVisible }) => {
  if (!isVisible || !contextKey) return null;

  return (
    <Alert className="mt-3 bg-accent/30 border-border text-accent-foreground ">
      
      <AlertDescription className="text-xs flex items-center gap-1">
      <Layers className="h-4 w-4 text-muted-foreground mr-1" />
       <span>Your response will be saved in context</span> 
        <span className="font-semibold text-foreground">{contextKey}</span>
      </AlertDescription>
    </Alert>
  );
};
