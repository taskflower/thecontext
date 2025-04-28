// src/types/index.ts

// Typ dla komponentu widgetu
export interface WidgetProps<T = any> {
  data?: T;
  onSelect?: (id: string) => void;
  attrs?: Record<string, any>;
}

// Typ dla komponentu layoutu
export interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  stepTitle?: string;
  onBackClick?: () => void;
}

// Typ dla komponentu kroku flow
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

// Typ dla danych węzła
export interface NodeData {
  id: string;
  label?: string;
  type?: string;
  template?: string;      // Zmienione z templateId na template
  assistantMessage?: string;
  contextPath?: string;
  order?: number;
  attrs?: Record<string, any>;
  scenarioId?: string;    // Dodane pole scenarioId
  [key: string]: any;
}

// Typ dla scenariusza
export interface Scenario {
  id: string;
  name: string;
  description?: string;
  nodes?: NodeData[];
  icon?: string;
  systemMessage?: string;     // Dodane pole systemMessage
  workspaceId?: string;       // Dodane pole workspaceId
  dependsOn?: string[];       // Dodane pole dependsOn
  getSteps?: () => NodeData[];
  [key: string]: any;
}

// Typ dla workspace
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  applicationId?: string;
  userId?: string;            // Dodane pole userId
  applicationName?: string;
  scenarios: Scenario[];
  initialContext?: Record<string, any>;
  templateSettings?: TemplateSettings;
  icon?: string;
  createdAt?: Date;           // Dodane pole createdAt
}

// Typ dla ustawień szablonu
export interface TemplateSettings {
  layout?: string;            // Zmienione z layoutTemplate na layout
  widgets?: WidgetConfig[];
  [key: string]: any;         // Dodane dla dowolnych dodatkowych pól
}

// Typ dla konfiguracji widgetu
export interface WidgetConfig {
  type: string;
  title?: string;
  data?: string | any;
  attrs?: Record<string, any>;
  dataPath?: string;          // Dodane pole dataPath
  dataPaths?: Record<string, string>; // Dodane pole dataPaths
  variant?: string;           // Dodane pole variant
}

// Typ dla aplikacji
export interface Application {
  id: string;
  name: string;
  description?: string;
  template?: string;          // Dodane pole template zgodnie z JSON
  workspaces?: Workspace[];
  templateSettings?: TemplateSettings;
  createdAt?: Date;
  createdBy?: string;
}

// Typ dla pola formularza
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