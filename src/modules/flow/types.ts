/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/types.ts

// Core type definitions for the application

// Basic node structure
export interface BaseNode {
    id: string;
    label: string;
    position: {
      x: number;
      y: number;
    };
    pluginKey?: string | null;
    userPrompt?: string;
    assistantMessage?: string;
  }
  
  // Edge structure
  export interface Edge {
    id: string;
    source: string;
    target: string;
    label?: string;
  }
  
  // Item hierarchy types
  export interface Scenario {
    id: string;
    label: string;
    children: BaseNode[];
    edges: Edge[];
  }
  
  export interface Workspace {
    id: string;
    label: string;
    children: Scenario[];
  }
  
  // Selection state
  export interface Selection {
    workspace: string | null;
    scenario: string | null;
    node: string | null;
  }
  
  // Flow actions interface
  export interface FlowActions {
    getActiveScenarioData: () => {
      nodes: Array<{
        id: string;
        data: {
          label: string;
          nodeId: string;
          prompt?: string;
          message?: string;
          pluginKey?: string | null;
        };
        position: { x: number; y: number };
        selected: boolean;
      }>;
      edges: Array<{
        id: string;
        source: string;
        target: string;
        label?: string;
      }>;
    };
    calculateFlowPath: () => BaseNode[];
  }
  
  // NodeMessage type for updates
  export interface NodeMessage {
    userPrompt?: string;
    assistantMessage?: string;
  }
  
  // Application state
  export interface AppState {
    items: Workspace[];
    selected: Selection;
    stateVersion: number;
    
    // Getters
    getCurrentWorkspace: () => Workspace | undefined;
    getCurrentScenario: () => Scenario | undefined;
    getNodeData: (nodeId: string) => BaseNode | undefined;
    
    // Node operations
    selectNode: (nodeId: string) => void;
    updateNodePosition: (nodeId: string, position: { x: number; y: number }) => void;
    setNodePlugin: (nodeId: string, pluginKey: string | null) => void;
    updateNodeMessage: (nodeId: string, message: NodeMessage) => void;
    
    // Edge operations
    addEdge: (edge: Omit<Edge, 'id'>) => void;
    
    // Includes Flow actions
    getActiveScenarioData: FlowActions['getActiveScenarioData'];
    calculateFlowPath: FlowActions['calculateFlowPath'];
  }
  
  // Step modal props
  export interface StepModalProps {
    steps: BaseNode[];
    currentStep: number;
    onNext: () => void;
    onPrev: () => void;
    onClose: () => void;
  }
  
  // Plugin types
  export interface PluginStore {
    components: Record<string, React.FC<any>>;
    getComponent: (key: string) => React.FC<any> | null;
    getComponentKeys: () => string[];
    registerComponent: (key: string, component: React.FC<any>) => void;
    unregisterComponent: (key: string) => void;
  }