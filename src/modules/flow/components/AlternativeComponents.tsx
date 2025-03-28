// src/modules/flow/components/AlternativeComponents.tsx
import React from "react";
import { Bot, Layers } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAppStore } from "@/modules/store";

export interface AlternativeHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  nodeName?: string;
  onClose: () => void;
}

export const AlternativeHeader: React.FC<AlternativeHeaderProps> = () => {
  // Get current workspace information from store
  const getCurrentWorkspace = useAppStore((state) => state.getCurrentWorkspace);
  const currentWorkspace = getCurrentWorkspace();
  return (
    <>
   
      <h1 className="p-8 mt-12 text-6xl font-bold">
        {" "}
        {currentWorkspace && (
          <>
            {" "}
            {currentWorkspace.title}{" "}
            <p className="mt-16 text-4xl  ">
              {currentWorkspace.description}
            </p>
          </>
        )}
      </h1>
      <div className="flex-1"></div>
    </>
  );
};

export interface AlternativeAssistantMessageProps {
  message?: string;
}

export const AlternativeAssistantMessage: React.FC<
  AlternativeAssistantMessageProps
> = ({ message }) => (
  <div className="flex items-start mb-6 max-w-2xl">
    <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
      <Bot className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Asystent:
      </p>
      <div className="bg-muted rounded-lg py-2 px-3 max-h-40 overflow-y-scroll">
        {message || "Czekam na Twoją odpowiedź..."}
      </div>
    </div>
  </div>
);

export interface AlternativeUserInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const AlternativeUserInput: React.FC<AlternativeUserInputProps> = ({
  value,
  onChange,
  placeholder = "Wpisz swoją wiadomość...",
}) => (
  <div className="mt-6">
    <p className="text-sm font-medium text-muted-foreground mb-2">
      Twoja odpowiedź:
    </p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-3 border border-input rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
      rows={3}
    ></textarea>
  </div>
);

export interface NavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
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

export interface ContextUpdateInfoProps {
  contextKey: string | undefined;
  isVisible: boolean;
}

export const ContextUpdateInfo: React.FC<ContextUpdateInfoProps> = ({
  contextKey,
  isVisible,
}) => {
  if (!isVisible || !contextKey) return null;

  return (
    <div className="mt-2 py-1.5 px-2 bg-primary/10 text-primary text-xs rounded-md flex items-center">
     <Layers className="mr-2 h-4 w-4" />
      <span>
        Twoja odpowiedź zostanie zapisana w kontekście{" "}
        <strong>{contextKey}</strong>
      </span>
    </div>
  );
};
