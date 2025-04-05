/**
 * Types for the template system
 */
import React from 'react';

// Basic Node type (simplified version of what's in core/types)
export interface Node {
  id: string;
  label?: string;
  description?: string;
  position?: { x: number, y: number };
  [key: string]: any;
}

// Template component props
export interface TemplateComponentProps {
  theme?: string;
  className?: string;
}

// Header component props
export interface HeaderProps extends TemplateComponentProps {
  title: string;
  description?: string;
  onBack?: () => void;
}

// Navigation component props
export interface NavigationProps extends TemplateComponentProps {
  currentStepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onFinish?: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Assistant message component props
export interface AssistantMessageProps extends TemplateComponentProps {
  message: string;
  contextValues?: Record<string, any>;
}

// User input component props
export interface UserInputProps extends TemplateComponentProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  contextKey?: string;
  contextJsonPath?: string;
  onSubmit?: () => void;
}

// Context update component props
export interface ContextUpdateProps extends TemplateComponentProps {
  contextKey?: string;
  contextJsonPath?: string;
}

// Layout component props
export interface LayoutProps extends TemplateComponentProps {
  children: React.ReactNode;
}

// Flow step component props
export interface FlowStepProps extends TemplateComponentProps {
  node: Node;
  userInput: string;
  onUserInputChange: (value: string) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  processTemplate: (text: string) => string;
}

// Template components interface
export interface TemplateComponents {
  Layout: React.ComponentType<LayoutProps>;
  Header: React.ComponentType<HeaderProps>;
  Navigation: React.ComponentType<NavigationProps>;
  AssistantMessage: React.ComponentType<AssistantMessageProps>;
  UserInput: React.ComponentType<UserInputProps>;
  ContextUpdateInfo: React.ComponentType<ContextUpdateProps>;
}

// Template configuration
export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;
  components: TemplateComponents;
}