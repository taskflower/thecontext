// src/views/types.ts
export interface NodeData {
  id: string;
  scenarioId: string;
  label: string;
  assistantMessage?: string;
  contextPath?: string; // Format: "userProfile" or "userProfile.email" or "userProfile.preferences.theme"
  contextKey?: string;
  contextJsonPath?: string;
  templateId: string;
  type?: string;
  attrs?: Record<string, any>;
  initialUserMessage?: string;
  includeSystemMessage?: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: string[];
}

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  theme?: 'light' | 'dark' | 'system';
  customStyles?: Record<string, string>;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
  edges?: any[];
  icon?: string; // Nowe pole dla ikony
}

export interface FlowStepProps {
  node: NodeData;
  onSubmit: (value: any) => void;
  onPrevious: () => void;
  isLastNode: boolean;
  contextItems?: any[];
}

export interface WidgetProps {
  data?: any;
  onSelect?: (id: string) => void;
  attrs?: Record<string, any>;
}