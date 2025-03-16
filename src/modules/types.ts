/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edge as ReactFlowEdgeType, Node as ReactFlowNodeType } from 'reactflow';
import { ContextState } from "./context/types";

export enum ElementType {
  WORKSPACE = 'workspace',
  SCENARIO = 'scenario',
  GRAPH_NODE = 'node',
  CONTEXT = 'context'
}

export type Position = {
  x: number;
  y: number;
};

export type FormData = {
  [key: string]: string | number;
};

export interface DialogField {
  name: string;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string }[];
}

export interface GraphNode {
  id: string;
  type: ElementType.GRAPH_NODE;
  label: string;
  assistant: string; 
  position: Position;
  userMessage?: string; 
  plugins?: string[];
  contextIds?: string[]; // IDs of contexts associated with this node
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Scenario {
  id: string;
  type: ElementType.SCENARIO;
  name: string;
  description?: string;
  children: GraphNode[]; 
  edges: GraphEdge[]; 
}

export interface Workspace {
  id: string;
  type: ElementType.WORKSPACE;
  title: string;
  children: Scenario[];
}

export interface Conversation {
  role: string;
  message: string;
}

// AppState rozszerzone o ContextState
export interface AppState extends ContextState {
  updateNodePlugins: any;
  items: Workspace[];
  selected: {
    workspace: string;
    scenario: string;
    node?: string;
    edge?: string;
  };
  stateVersion: number;
  conversation: Conversation[];
  
  // Workspace methods
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
  
  // Scenario methods
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: { name: string; description?: string }) => void;
  deleteScenario: (scenarioId: string) => void;
  
  // Node methods
  addNode: (payload: { label: string; assistant: string; position?: Position }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  selectNode: (nodeId: string) => void;
  setUserMessage: (nodeId: string, message: string) => void;
  
  // Edge methods
  addEdge: (payload: { source: string; target: string; label?: string }) => void;
  deleteEdge: (edgeId: string) => void;
  selectEdge: (edgeId: string) => void;
  
  // Conversation methods
  addToConversation: (payload: { role: string; message: string }) => void;
  clearConversation: () => void;
  
  // Helper methods
  getCurrentScenario: () => Scenario | null;
  getActiveScenarioData: () => FlowData;
  clearSelection: () => void;
}

export type ReactFlowEdge = ReactFlowEdgeType<any>;
export type ReactFlowNode = ReactFlowNodeType;

export interface FlowData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}