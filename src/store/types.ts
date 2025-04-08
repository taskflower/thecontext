/* eslint-disable @typescript-eslint/no-explicit-any */
// store/types.ts
import { NodeManager } from '../../raw_modules/nodes-module/src';

// Podstawowe typy danych
export interface Position {
  x: number;
  y: number;
}

// Definicja pól formularza dla pluginów
export interface FormFieldDefinition {
  type: 'text' | 'number' | 'select' | 'multiline' | 'url';
  name: string;
  label: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface Node {
  id: string;
  scenarioId: string;
  label: string;
  description: string;
  position: Position;
  assistantMessage: string;
  contextKey: string;
  contextJsonPath?: string;
  type?: string;
  userPrompt?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  
  // Nowe pola pluginów
  pluginType?: 'url-input' | 'form' | 'custom';
  pluginConfig?: {
    inputType?: string;
    placeholder?: string;
    validation?: {
      pattern?: string;
      required?: boolean;
    };
    formFields?: FormFieldDefinition[];
  };
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: Node[];
}

export interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
}

export interface ContextItem {
  id: string;
  title: string;
  content: string;
  contentType?: string;
  updatedAt?: Date;
}

export interface FlowState {
  currentIndex: number;
  userInput: string;
}

// Interfejs pluginu
export interface Plugin {
  id: string;
  name: string;
  type: 'node-transformer' | 'ui-extension' | 'context-modifier';
  handler: (data: any) => any;
}

// Typy dla poszczególnych slice'ów storeu
export interface UIState {
  view: 'workspaces' | 'scenarios' | 'flow' | 'nodeEditor' | 'contextEditor';
  selectedIds: {
    workspace: string | null;
    scenario: string | null;
    node: string | null;
  };
}

export interface WorkspaceState {
  workspaces: Workspace[];
}

export interface NodeState {
  nodeForm: Node | null;
  currentFlowNode: any | null;
}

export interface FlowExecutionState {
  flowState: FlowState;
}

export interface ContextState {
  contextItems: ContextItem[];
  contextForm: ContextItem[] | null;
}

// Stan pluginów
export interface PluginState {
  registeredPlugins: Plugin[];
}

// Akcje UI
export interface UIActions {
  setView: (view: UIState['view']) => void;
  setSelectedIds: (ids: Partial<UIState['selectedIds']>) => void;
  navigateBack: () => void;
}

// Akcje workspace'ów
export interface WorkspaceActions {
  createWorkspace: (name: string) => void;
  deleteWorkspace: (id: string) => void;
  getWorkspace: () => Workspace | undefined;
  
  // Akcje dla scenariuszy
  createScenario: (name: string) => void;
  deleteScenario: (id: string) => void;
  getScenario: () => Scenario | undefined;
}

// Akcje węzłów
export interface NodeActions {
  createNode: (label: string) => void;
  editNode: (id: string) => void;
  updateNode: () => void;
  deleteNode: (id: string) => void;
  getNodes: () => Node[];
  getNode: (id: string) => Node | undefined;
  prepareCurrentNode: () => void;
}

// Akcje flow
export interface FlowActions {
  updateFlowInput: (input: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  finishFlow: () => void;
}

// Akcje kontekstu
export interface ContextActions {
  editContext: () => void;
  saveContext: () => void;
  updateContextForm: (items: ContextItem[]) => void;
}

// Akcje pluginów
// w pliku src/store/types.ts

export interface PluginActions {
  registerPlugin: (plugin: Plugin) => void;
  applyNodePlugins: (node: Node) => Node;
  validateNodePlugin: (node: Node) => { isValid: boolean; errors?: string[] };
}

// Pełen stan aplikacji
export interface AppState extends 
  UIState, 
  WorkspaceState, 
  NodeState, 
  FlowExecutionState, 
  ContextState,
  PluginState {
  // Wspólne pola
  nodeManager: NodeManager;
}

// Pełen store z akcjami
export type AppStore = AppState & 
  UIActions & 
  WorkspaceActions & 
  NodeActions & 
  FlowActions & 
  ContextActions & 
  PluginActions;