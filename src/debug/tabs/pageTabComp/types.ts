import { WorkspaceConfig } from "@/core";

export interface NodeConfig {
  slug?: string;
  label?: string;
  description?: string;
  tplFile?: string;
  tplDir?: string;
  order?: number;
  contextSchemaPath?: string;
  contextDataPath?: string;
  [key: string]: any; // For other dynamic properties
}

export interface ScenarioConfig {
  slug: string;
  name?: string;
  description?: string;
  workspaceSlug?: string;
  icon?: string;
  tplDir?: string;
  nodes?: NodeConfig[];
}

export interface WidgetConfig {
  title: string;
  tplFile: string;
  colSpan?: string | number;
  data?: string;
  [key: string]: any; // For other dynamic properties
}

export interface TemplateSettings {
  layoutFile?: string;
  widgets?: WidgetConfig[];
  [key: string]: any; // For other dynamic properties
}



export interface PageTabConfig {
  id?: string;
  name?: string;
  description?: string;
  tplDir?: string;
  workspaces: WorkspaceConfig[];
  scenarios: ScenarioConfig[];
}

export interface SelectedItems {
  workspace: string | null;
  scenario: string | null;
  step?: number;
}

export interface PageTabProps {
  config: PageTabConfig;
}

export interface ConfigDetailProps {
  config: PageTabConfig;
}