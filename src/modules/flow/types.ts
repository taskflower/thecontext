/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flow/types.ts
export interface FlowPosition {
    x: number;
    y: number;
  }
  
  export interface FlowNode {
    id: string;
    label: string;
    assistant: string;
    position: FlowPosition;
    plugin?: string;
    pluginOptions?: Record<string, any>;
    contextSaveKey?: string;
    userMessage?: string;
  }
  
  export interface FlowEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
  }
  
  export interface Flow {
    id: string;
    name: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
  }