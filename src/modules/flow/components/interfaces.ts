// src/modules/flow/components/interfaces.ts

// Wspólne interfejsy dla wszystkich komponentów dialogowych
export interface HeaderProps {
    currentStepIndex: number;
    totalSteps: number;
    nodeName?: string;
    onClose: () => void;
  }
  
  export interface AssistantMessageProps {
    message?: string;
  }
  
  export interface UserInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  }
  
  export interface NavigationButtonsProps {
    isFirstStep: boolean;
    isLastStep: boolean;
    isProcessing: boolean;
    onPrevious: () => void;
    onNext: () => void;
  }
  
  export interface ContextUpdateInfoProps {
    contextKey: string | undefined;
    isVisible: boolean;
  }
  
  // Typ określający dostępne szablony dialogowe
  export type DialogTemplate = 'default' | 'alternative';
  
  // Interfejs fabryki komponentów dialogowych
  export interface DialogComponents {
    Header: React.FC<HeaderProps>;
    AssistantMessage: React.FC<AssistantMessageProps>;
    UserInput: React.FC<UserInputProps>;
    NavigationButtons: React.FC<NavigationButtonsProps>;
    ContextUpdateInfo: React.FC<ContextUpdateInfoProps>;
  }