// src/modules/flow/components/DefaultComponents.tsx
import React from 'react';
import { Bot, X } from 'lucide-react';
import { cn } from '@/utils/utils';

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
  onClose 
}) => (
  <>
  <div className="flex items-center justify-between p-4 border-b border-border">
    <h3 className="text-lg font-medium">
      Krok {currentStepIndex + 1} z {totalSteps}: {nodeName || `Krok ${currentStepIndex + 1}`}
    </h3>
    <button
      onClick={onClose}
      className="p-1 rounded-full hover:bg-muted"
    >
      <X className="h-5 w-5" />
    </button>
  </div>
  <div className='flex-1'></div>
  </>
);

export interface DefaultAssistantMessageProps {
  message?: string;
}

export const DefaultAssistantMessage: React.FC<DefaultAssistantMessageProps> = ({ message }) => (
  <div className="flex items-start mb-6">
    <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
      <Bot className="h-4 w-4 text-primary" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-muted-foreground mb-1">
        Asystent:
      </p>
      <div className="bg-muted rounded-lg py-2 px-3">
        {message || "Czekam na Twoją odpowiedź..."}
      </div>
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
  placeholder = "Wpisz swoją wiadomość..." 
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
  onNext
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
  isVisible 
}) => {
  if (!isVisible || !contextKey) return null;
  
  return (
    <div className="mt-2 py-1.5 px-2 bg-primary/10 text-primary text-xs rounded-md flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
      <span>
        Twoja odpowiedź zostanie zapisana w kontekście <strong>{contextKey}</strong>
      </span>
    </div>
  );
};