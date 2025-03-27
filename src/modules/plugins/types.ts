// src/modules/plugins/types.ts
import { ComponentType } from "react";

// Props przekazywane do każdego pluginu
export interface PluginComponentProps<T = unknown> {
  data: T | null;
  appContext: AppContextData;
  
  // Opcjonalne zastąpienie UI
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
}

// Statyczne ustawienia pluginu
export interface PluginSettings {
  replaceHeader?: boolean;
  replaceAssistantView?: boolean;
  replaceUserInput?: boolean;
  hideNavigationButtons?: boolean; // Nowa opcja do ukrywania przycisków nawigacyjnych
}

// Schemat opcji pluginu
export interface PluginOptionSchema {
  type: "string" | "number" | "boolean" | "color";
  label?: string;
  description?: string;
  default: unknown;
}

// Rozszerzony typ komponentu dla pluginu, który zawiera dodatkowe statyczne właściwości
export interface PluginComponentWithSchema<T = unknown> extends React.FC<PluginComponentProps<T>> {
  optionsSchema?: Record<string, PluginOptionSchema>;
  pluginSettings?: PluginSettings;
}

// Definicja stanu pluginu (np. czy jest włączony)
export interface Plugin {
  key: string;
  enabled: boolean;
}

// Dane kontekstu aplikacji przekazywane do pluginów
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
  
  // Funkcje aktualizujące komunikaty węzłów (opcjonalnie)
  updateNodeUserPrompt?: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage?: (nodeId: string, message: string) => void;
  
  // Funkcje nawigacyjne dla flow
  nextStep?: () => void;
  prevStep?: () => void;
}

// Interfejs dla dynamicznego store'u komponentów
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

// Rozszerzenie stanu aplikacji, który może być używany w wrapperach
export interface AppState {
  selected: {
    node: string;
    scenario: string;
    workspace: string;
  };
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
}

// Typy odpowiadające strukturom danych aplikacji
export interface WorkspaceData {
  id: string;
  name: string;
  children: ScenarioData[];
  [key: string]: unknown;
}

export interface ScenarioData {
  id: string;
  name: string;
  children: NodeData[];
  [key: string]: unknown;
}

export interface NodeData {
  id: string;
  label?: string;
  name?: string;
  userPrompt?: string;
  assistantMessage?: string;
  pluginKey?: string;
  pluginData?: Record<string, unknown>;
  [key: string]: unknown;
}

// Props dla komponentu PluginPreviewWrapper
export interface PluginPreviewWrapperProps {
  componentKey: string;
  customData?: unknown;
  context?: Partial<AppContextData>;
  showHeader?: boolean;
  className?: string;
}

// Mapowanie danych pluginów
export type PluginDataMap = Record<string, unknown>;