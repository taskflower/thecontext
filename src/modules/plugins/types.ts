/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins/types.ts
import { ComponentType } from 'react';

// Plugin component props
export interface PluginComponentProps<T = unknown> {
  data: T;
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
}

// Dynamic component store interface
export interface DynamicComponentStore {
  components: Record<string, ComponentType<PluginComponentProps>>;
  componentData: Record<string, unknown>;

  registerComponent: (key: string, component: ComponentType<PluginComponentProps>) => void;
  unregisterComponent: (key: string) => void;
  setComponentData: (key: string, data: unknown) => void;
  getComponentData: (key: string) => unknown;
  getComponentKeys: () => string[];
  getComponent: (key: string) => ComponentType<PluginComponentProps> | null;
}

// These types should match your app's data structures
// Replace these with your actual types
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