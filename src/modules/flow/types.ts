// src/modules/flow/types.ts
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface FlowPosition {
  x: number;
  y: number;
}

export interface FlowNode {
  id: string;
  // Basic node properties
  label?: string;
  type?: string;
  position?: FlowPosition;
  
  // Flow content properties
  assistant?: string;
  plugin?: string;
  pluginOptions?: Record<string, Record<string, any>>;
  contextSaveKey?: string;
  userMessage?: string;
  
  // Optional user input plugin
  userInputPlugin?: string;
  
  // Any other properties in your node type
  data?: Record<string, any>;
  children?: FlowNode[];
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  label?: string;
}

export interface Flow {
  id: string;
  name: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
}