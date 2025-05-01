// src/types/index.ts

export interface WidgetProps<T = any> {
  data?: T;
  onSelect?: (id: string) => void;
  attrs?: Record<string, any>;
}

export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  stepTitle?: string;
  onBackClick?: () => void;
}

export interface FlowStepProps {
  node: NodeData;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isLastNode: boolean;
  isFirstNode: boolean;
  contextItems?: [string, any][];
  scenario?: any;
  stepTitle?: string;
}

export interface NodeData {
  id: string;
  label?: string;
  type?: string;
  template?: string;     
  assistantMessage?: string;
  contextPath?: string;
  order?: number;
  attrs?: Record<string, any>;
  scenarioId?: string;    
  [key: string]: any;
}

export interface Scenario {
  id: string;
  name: string;
  description?: string;
  nodes?: NodeData[];
  icon?: string;
  systemMessage?: string;    
  workspaceId?: string;       
  dependsOn?: string[];       
  getSteps?: () => NodeData[];
  [key: string]: any;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  applicationId?: string;
  userId?: string;           
  applicationName?: string;
  scenarios: Scenario[];
  initialContext?: Record<string, any>;
  templateSettings?: TemplateSettings;
  icon?: string;
  createdAt?: Date;          
}

export interface TemplateSettings {
  layout?: string;           
  widgets?: WidgetConfig[];
  [key: string]: any;         
}

export interface WidgetConfig {
  type: string;
  title?: string;
  data?: string | any;
  attrs?: Record<string, any>;
  dataPath?: string;
  dataPaths?: Record<string, string>;
  variant?: string;
}

export interface Application {
  id: string;
  name: string;
  description?: string;
  template?: string;
  workspaces?: Workspace[];
  templateSettings?: TemplateSettings;
  createdAt?: Date;
  createdBy?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  options?: string[];
  placeholder?: string;
  helperText?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
}