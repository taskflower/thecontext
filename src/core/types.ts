export interface NodeConfig {
  slug: string;
  label: string;
  description?: string;
  contextSchemaPath: string;
  contextDataPath: string;
  tplFile: string;
  order: number;
  attrs?: Record<string, any>;
  saveToDB?: {
    enabled: boolean;
    provider: "indexedDB";
    itemId?: string;
    itemType: string;
    itemTitle?: string;
    contentPath?: string;
  };
}

export interface ScenarioConfig {
  slug: string;
  workspaceSlug: string;
  name: string;
  description?: string;
  icon?: string;
  systemMessage?: string;
  nodes: NodeConfig[];
  roleAccess?: string[];
}

export interface WorkspaceConfig {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  templateSettings?: TemplateSettings;
  scenarios: ScenarioConfig[];
  contextSchema: {
    type: string;
    properties: Record<string, any>;
  };
}

export interface TemplateSettings {
  tplDir?: string;
  layoutFile: string;
  widgets?: Array<{
    tplFile: string;
    [key: string]: any;
  }>;
}

export interface AppConfig {
  name: string;
  description?: string;
  tplDir: string;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
  defaultWorkspace?: string;
  defaultScenario?: string;
}

export interface TemplateComponentProps<T = any> {
  schema: any;
  data?: T;
  onSubmit: (data: T) => void;
  [key: string]: any;
}

export interface WidgetProps {
  title?: string;
  data?: any;
  [key: string]: any;
}
export type FCWithChildren<P = {}> = React.FC<P & { children?: React.ReactNode }>;