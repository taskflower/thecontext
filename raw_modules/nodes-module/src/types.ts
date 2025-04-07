/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types.ts
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
    userPrompt?: string;
    contextKey?: string;
    contextJsonPath?: string;
    pluginKey?: string;
    pluginData?: Record<string, any>;
    createdAt?: Date;
    updatedAt?: Date;
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