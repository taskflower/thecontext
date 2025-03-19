/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flowPlayer/types.ts
import { ComponentType } from "../plugin";
import { ElementType, Position } from "../types";


export interface FlowNode {
  id: string;
  type: ElementType.GRAPH_NODE;
  label: string;
  assistant: string;
  position: Position;
  plugin?: string;
  pluginOptions?: { [pluginId: string]: Record<string, any> };
  contextSaveKey?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ConversationMessage {
  role: 'assistant' | 'user';
  message: string;
}

export interface FlowState {
  // Current flow data
  currentNodeIndex: number;
  flowPath: FlowNode[];
  userMessage: string;
  
  // Processing state
  processedNodes: Set<string>;
  isProcessing: boolean;
  
  // Component registry
  componentOverrides: Partial<Record<ComponentType, React.ComponentType<any>>>;
}

export interface FlowContextValue {
  // State properties
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  userMessage: string;
  isProcessing: boolean;
  
  // Flow navigation
  nextNode: (userMsg?: string) => void;
  previousNode: () => void;
  resetFlow: () => void;
  
  // User input
  updateUserMessage: (value: string) => void;
  
  // Node processing
  isNodeProcessed: (nodeId: string) => boolean;
  markNodeAsProcessed: (nodeId: string) => void;
  
  // Component registry
  getComponent: (type: ComponentType) => React.ComponentType<any>;
}