/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins/types.ts
import { ComponentType } from "react";

// Plugin component props
export interface PluginComponentProps<T = unknown> {
  data: T | null;
  appContext: AppContextData;
}

// Plugin state
export interface Plugin {
  key: string;
  enabled: boolean;
}

// Application context data passed to plugins
export interface AppContextData {
  currentWorkspace: WorkspaceData | null;
  currentScenario: ScenarioData | null;
  currentNode: NodeData | null;
  selection: {
    workspaceId: string;
    scenarioId: string;
    nodeId: string;
  };
  stateVersion: number;
  // Add the update functions that are used in wrappers
  updateNodeUserPrompt?: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage?: (nodeId: string, message: string) => void;
}

// Dynamic component store interface
export interface DynamicComponentStore {
  components: Record<string, ComponentType<PluginComponentProps>>;
  componentData: Record<string, unknown>;

  registerComponent: (
    key: string,
    component: ComponentType<PluginComponentProps>
  ) => void;
  unregisterComponent: (key: string) => void;
  setComponentData: (key: string, data: unknown) => void;
  getComponentData: (key: string) => unknown;
  getComponentKeys: () => string[];
  getComponent: (key: string) => ComponentType<PluginComponentProps> | null;
}

// Plugin component with options schema
export interface PluginComponentWithSchema<T = unknown>
  extends React.FC<PluginComponentProps<T>> {
  optionsSchema?: Record<string, PluginOptionSchema>;
}

// Schema for plugin options
export interface PluginOptionSchema {
  type: "string" | "number" | "boolean" | "color";
  label?: string;
  description?: string;
  default: unknown;
}

// App store augmentation for wrapper components
export interface AppState {
  selected: {
    node: string;
    scenario: string;
    workspace: string;
  };
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
}

// These types should match your app's data structures
export interface WorkspaceData {
  id: string;
  name: string;
  children: ScenarioData[];
  [key: string]: any;
}

export interface ScenarioData {
  id: string;
  name: string;
  children: NodeData[];
  [key: string]: any;
}

export interface NodeData {
  id: string;
  name: string;
  pluginData?: Record<string, unknown>;
  [key: string]: any;
}

// Props interface for PluginPreviewWrapper
export interface PluginPreviewWrapperProps {
  componentKey: string;
  customData?: unknown;
  context?: Partial<AppContextData>;
  showHeader?: boolean;
  className?: string;
}

export type PluginDataMap = Record<string, any>;
