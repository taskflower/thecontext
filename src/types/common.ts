/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/common.ts
export interface Position {
    x: number;
    y: number;
  }
  
  export interface NodeData {
    content?: string;
    prompt?: string;
    response?: string;
    variables?: Record<string, string>;
    pluginId?: string | null;
    pluginConfig?: Record<string, any>;
    label?: string;
    type?: string;
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
    input: string;
    output: string;
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