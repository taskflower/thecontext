// src/modules/plugins/types.ts



// Definicja interfejsu AppContextData
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

// Definicja bazowych typów danych aplikacji
export interface WorkspaceData {
  id: string;
  title: string;
  children: ScenarioData[];
  [key: string]: unknown;
}

export interface ScenarioData {
  id: string;
  name: string;
  description: string;
  children: NodeData[];
  edges: EdgeData[];
  [key: string]: unknown;
}

export interface NodeData {
  id: string;
  label: string;
  value: number;
  position: { x: number; y: number };
  pluginKey?: string;
  [key: string]: unknown;
}

export interface EdgeData {
  id: string;
  source: string;
  target: string;
  label?: string;
  type: string;
  [key: string]: unknown;
}

// Plugin tracking
export interface Plugin {
  key: string;
  enabled: boolean;
}

// Główny interfejs dla komponentów pluginów
export interface PluginComponentProps<T = unknown> {
  data: T;
  appContext: AppContextData;
}

// Typy używane do rejestracji komponentów
export interface PluginRegistry {
  registry: DynamicComponentStore;
  register: (key: string, component: React.ComponentType<PluginComponentProps>) => void;
  unregister: (key: string) => void;
}

// Typy dla store pluginów
export interface DynamicComponentStore {
  components: Record<string, React.ComponentType<PluginComponentProps>>;
  componentData: Record<string, unknown>;
  registerComponent: (key: string, component: React.ComponentType<PluginComponentProps>) => void;
  unregisterComponent: (key: string) => void;
  setComponentData: (key: string, data: unknown) => void;
  getComponentData: (key: string) => unknown;
  getComponentKeys: () => string[];
  getComponent: (key: string) => React.ComponentType<PluginComponentProps> | null;
}

// Deklaracja dla globalnego obiektu window
declare global {
  interface Window {
    __DYNAMIC_COMPONENTS__: PluginRegistry;
  }
}