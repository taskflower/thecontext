// src/types/index.ts
import { ReactNode } from 'react';

export interface NodeData {
  id: string;
  scenarioId: string;
  type?: string;
  label: string;
  assistantMessage?: string;
  contextKey?: string;
  contextJsonPath?: string;
  templateId?: string;
  attrs?: {
    [key: string]: any;
  };
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  [key: string]: any;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  systemMessage?: string;
}

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  theme?: string;
}

// Dodajemy typy, które wcześniej były w module template-registry-module
export interface LayoutProps {
  children?: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  [key: string]: any;
}

export interface WidgetProps {
  data?: any;
  onSelect?: (id: string) => void;
  [key: string]: any;
}

export interface FlowStepProps {
  node: any;
  onSubmit: (value: any) => void;
  onPrevious?: () => void;
  isLastNode?: boolean;
  contextItems?: [string, any][];
  [key: string]: any;
}