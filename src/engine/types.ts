// engine/types.ts
export interface BaseConfig {
  slug: string;
}

export interface TemplateConfig {
  tplFile: string;
  [key: string]: any;
}

export interface Widget extends TemplateConfig {
  colSpan?: string | number;
  attrs?: Record<string, any>;
}

export interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
}

export interface WorkspaceConfig extends BaseConfig {
  templateSettings: {
    layoutFile: string;
    widgets: Widget[];
  };
}

export interface ScenarioNode extends BaseConfig, TemplateConfig {
  label: string;
  order: number;
  attrs?: {
    widgets?: Widget[];
    [key: string]: any;
  };
}

export interface ScenarioConfig extends BaseConfig {
  nodes: ScenarioNode[];
}

export interface AppParams extends Record<string, string | undefined> {
  config: string;
  workspace: string;
  scenario?: string;
  step?: string;
}