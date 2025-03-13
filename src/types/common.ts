/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/common.ts


export interface Position {
    x: number;
    y: number;
  }
  
  export interface NodeData {
    prompt?: string;
    message?: string;
    variables?: Record<string, string>;
    pluginId?: string | null;
    pluginConfig?: Record<string, any>;
    label?: string;
    type?: string;
    isStartNode?: boolean;
    status?: 'completed' | 'error' | 'running' | string;
    [key: string]: any;
  }
  
  export interface Node {
    id: string;
    type: string;
    position: Position;
    data: NodeData;
    scenarioId: string;
    createdAt: number;
    updatedAt: number;
    isStartNode?: boolean; // Nowa flaga określająca węzeł startowy
  }
  
  export interface Edge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    label?: string;
  }
  
  export interface Scenario {
    id: string;
    workspaceId: string;
    name: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    isTemplate: boolean;
    templateId?: string;
    edgeIds: string[];
  }
  
  export interface ExecutionResult {
    nodeId: string;
    prompt: string;
    message: string;
    pluginId?: string;
    pluginResult?: any;
    timestamp: number;
    duration: number;
  }
  
  export interface Execution {
    id: string;
    scenarioId: string;
    startTime: number;
    endTime?: number;
    status: 'running' | 'completed' | 'error' | 'interrupted';
    currentNodeId?: string;
    results: Record<string, ExecutionResult>;
    error?: string;
  }
  
  export interface Workspace {
    id: string;
    name: string;
    description: string;
    createdAt: number;
    updatedAt: number;
    context: Record<string, any>;
    scenarioIds: string[];
    nodes: any[]; 
  }

  export interface ExportedData {
    version: string;
    exportedAt: string;
    workspace: Workspace;
    scenarios: Record<string, Scenario>;
    nodes: Record<string, Node>;
    edges: Record<string, Edge>;
    plugins: Record<string, ExportedPluginData>;
  }
  
  export interface ExportedPluginData {
    id: string;
    config: Record<string, any>;
  }