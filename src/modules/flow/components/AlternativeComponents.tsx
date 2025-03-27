// src/modules/flow/components/AlternativeComponents.tsx
import React from 'react';
import { Bot, X } from 'lucide-react';
import { cn } from '@/utils/utils';

export interface AlternativeHeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  nodeName?: string;
  onClose: () => void;
}

export const AlternativeHeader: React.FC<AlternativeHeaderProps> = ({ 
  currentStepIndex, 
  totalSteps, 
  nodeName, 
  onClose 
}) => (
  <div className="flex items-center justify-between p-4 bg-primary/10 border-b border-primary/30">
    <h3 className="text-lg font-bold text-primary">
      Step {currentStepIndex + 1} of {totalSteps}: {nodeName || `Step ${currentStepIndex + 1}`}
    </h3>
    <button
      onClick={onClose}
      className="p-1 rounded-full hover:bg-primary/20"
    >
      <X className="h-5 w-5 text-primary" />
    </button>
  </div>
);

export interface AlternativeAssistantMessageProps {
  message?: string;
}

export const AlternativeAssistantMessage: React.FC<AlternativeAssistantMessageProps> = ({ message }) => (
  <div className="flex items-start mb-6">
    <div className="flex-shrink-0 bg-secondary w-10 h-10 rounded-lg flex items-center justify-center mr-3">
      <Bot className="h-5 w-5 text-secondary-foreground" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-secondary mb-1">
        Assistant:
      </p>
      <div className="bg-secondary/10 border border-secondary/20 rounded-lg py-3 px-4 text-secondary-foreground">
        {message || "Waiting for your response..."}
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
  placeholder = "Type your message..." 
}) => (
  <div className="mt-6">
    <p className="text-sm font-semibold text-secondary mb-2">
      Your response:
    </p>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-4 border-2 border-secondary/30 rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
      rows={4}
    ></textarea>
  </div>
);

export interface AlternativeNavigationButtonsProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isProcessing: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const AlternativeNavigationButtons: React.FC<AlternativeNavigationButtonsProps> = ({
  isFirstStep,
  isLastStep,
  isProcessing,
  onPrevious,
  onNext
}) => (
  <div className="flex justify-between p-4 bg-muted/30">
    <button
      onClick={onPrevious}
      disabled={isFirstStep || isProcessing}
      className={cn(
        "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
        isFirstStep || isProcessing
          ? "bg-muted text-muted-foreground cursor-not-allowed"
          : "bg-secondary/20 text-secondary hover:bg-secondary/30"
      )}
    >
      ← Previous
    </button>

    <button
      onClick={onNext}
      disabled={isProcessing}
      className={cn(
        "px-6 py-2 rounded-lg text-sm font-bold transition-colors",
        isProcessing 
          ? "bg-secondary/70 text-secondary-foreground cursor-wait" 
          : "bg-secondary text-secondary-foreground hover:bg-secondary/90"
      )}
    >
      {isLastStep ? "Finish" : "Next →"}
    </button>
  </div>
);

export interface AlternativeContextUpdateInfoProps {
  contextKey: string | undefined;
  isVisible: boolean;
}

export const AlternativeContextUpdateInfo: React.FC<AlternativeContextUpdateInfoProps> = ({ 
  contextKey, 
  isVisible 
}) => {
  if (!isVisible || !contextKey) return null;
  
  return (
    <div className="mt-3 py-2 px-3 bg-secondary/10 text-secondary text-xs rounded-lg flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span>
        Your response will be saved in context <strong>{contextKey}</strong>
      </span>
    </div>
  );
};