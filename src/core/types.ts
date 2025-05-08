// Definicje typów dla całego flow-app-builder

export interface NodeConfig {
  slug: string;
  label: string;
  contextSchemaPath: string;
  contextDataPath: string;
  tplFile: string;
  order: number;
  attrs?: Record<string, any>;
  saveToDB?: {
    enabled: boolean;
    provider: "indexedDB";
    itemId?: string;
    itemType: "lesson" | "quiz" | "project";
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
}

export interface WorkspaceConfig {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  templateSettings?: TemplateSettings;
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
