// src/modules/flow/components/interfaces.ts
import React from "react";

/**
 * Props for the Header component
 */
export interface HeaderProps {
  /** Current step index (0-based) */
  currentStepIndex: number;
  /** Total number of steps in the flow */
  totalSteps: number;
  /** Name of the current node */
  nodeName?: string;
   /** Description of the current node */
   nodeDescription?: string;
  /** Callback when close button is clicked */
  onClose: () => void;
}

/**
 * Props for the AssistantMessage component
 */
export interface AssistantMessageProps {
  /** The message content to display */
  message?: string;
}

/**
 * Props for the UserInput component
 */
export interface UserInputProps {
  /** Current input value */
  value: string;
  /** Callback when input changes */
  onChange: (value: string) => void;
  /** Placeholder text when input is empty */
  placeholder?: string;
}

/**
 * Props for the NavigationButtons component
 */
export interface NavigationButtonsProps {
  /** Whether this is the first step in the flow */
  isFirstStep: boolean;
  /** Whether this is the last step in the flow */
  isLastStep: boolean;
  /** Whether the system is currently processing */
  isProcessing: boolean;
  /** Callback for previous button */
  onPrevious: () => void;
  /** Callback for next/finish button */
  onNext: () => void;
}

/**
 * Props for the ContextUpdateInfo component
 */
export interface ContextUpdateInfoProps {
  /** The context key being updated */
  contextKey: string | undefined;
  /** Whether the component should be visible */
  isVisible: boolean;
}

/**
 * Available dialog template types
 */
export type DialogTemplate =
  | "default"
  | "alternative"
  | "elearning"
  | "bigballs";

/**
 * Factory interface for dialog components
 */
export interface DialogComponents {
  Header: React.FC<HeaderProps>;
  AssistantMessage: React.FC<AssistantMessageProps>;
  UserInput: React.FC<UserInputProps>;
  NavigationButtons: React.FC<NavigationButtonsProps>;
  ContextUpdateInfo: React.FC<ContextUpdateInfoProps>;
}
