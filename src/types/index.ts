// src/types/index.ts
import { ReactNode } from 'react';

// Podstawowe typy
export type IconType = string;

// Komponenty
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  stepTitle?: string;
  onBackClick?: () => void;
}

export interface WidgetProps {
  data?: any;
  onSelect?: (id: string) => void;
  attrs?: Record<string, any>;
}

export interface FlowStepProps {
  node: NodeData;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isLastNode: boolean;
  isFirstNode: boolean;
  contextItems?: any[][];
  scenario?: Scenario;
  stepTitle?: string;
}

// Widget specifyczne typy
export interface StatsWidgetProps extends WidgetProps {
  title?: string;
  description?: string;
  stats?: Array<{ 
    label: string; 
    value: any;
    description?: string;
    icon?: string;
  }>;
}

export interface InfoWidgetProps extends WidgetProps {
  title?: string;
  content?: string | React.ReactNode;
  icon?: string;
  variant?: 'default' | 'info' | 'success' | 'warning' | 'error';
}

export interface DataDisplayWidgetProps extends WidgetProps {
  title?: string;
  description?: string;
  type?: 'list' | 'object' | 'keyValue' | 'code';
}

// Szablony
export interface LayoutTemplate {
  id: string;
  name: string;
  component: React.ComponentType<LayoutProps>;
}

export interface WidgetTemplate {
  id: string;
  name: string;
  category: string;
  component: React.ComponentType<WidgetProps>;
}

export interface FlowStepTemplate {
  id: string;
  name: string;
  compatibleNodeTypes: string[];
  component: React.ComponentType<FlowStepProps>;
}

// Dane przepływu
export interface NodeData {
  id: string;
  scenarioId: string;
  label: string;
  assistantMessage?: string;
  contextPath?: string;
  templateId: string;
  type?: string;
  attrs?: Record<string, any>;
  initialUserMessage?: string;
  includeSystemMessage?: boolean;
  order?: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
  icon?: IconType;
  [key: string]: any;
}

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  theme?: 'light' | 'dark' | 'system';
  customStyles?: Record<string, string>;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext: Record<string, any>;
  icon?: IconType;
}

// Pole formularza
export interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
}