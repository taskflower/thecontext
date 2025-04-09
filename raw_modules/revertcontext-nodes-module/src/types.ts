// raw_modules/revertcontext-nodes-module/src/types.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  id?: string;
  scenarioId: string;
  type?: string;
  label: string;
  description?: string; 
  position?: Position;
  assistantMessage?: string;
  initialUserMessage?: string;
  userPrompt?: string;
  contextKey?: string;
  contextJsonPath?: string;
  pluginKey?: string;
  pluginData?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
  // System message flag
  includeSystemMessage?: boolean;
  // Template ID for UI rendering
  templateId?: string;
  // Form fields for form-type nodes
  formFields?: Array<{
    name: string;
    label: string;
    type: string;
    required: boolean;
  }>;
  [key: string]: any;
}

export interface ContextItem {
  id: string;
  title: string;
  content: string;
  contentType?: string;
  updatedAt?: Date;
  [key: string]: any;
}

export interface NodeExecutionResult {
  node: NodeData;
  contextUpdated: boolean;
  updatedContext: ContextItem[];
}

export interface PluginExecutionResult {
  success: boolean;
  data: any;
  error?: string;
}

export interface NodeStoreAdapter {
  getNode(nodeId: string): Promise<NodeData | null>;
  getNodesByScenario(scenarioId: string): Promise<NodeData[]>;
  saveNode(nodeData: NodeData): Promise<NodeData>;
  deleteNode(nodeId: string): Promise<boolean>;
}

// Rozszerzony interfejs Scenario z systemMessage
export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  // System message for LLM interactions
  systemMessage?: string;
  // Optional edges for graph representation
  edges?: any[];
}