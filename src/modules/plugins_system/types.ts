/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins-system/types.ts
// Simplified Plugin interface that aligns with the Node structure

import { Edge, Node } from "../scenarios_module/types";

export interface PluginConfig {
  [key: string]: any;
}

export interface PluginState {
  config: PluginConfig;
  result: any;
}

export interface PluginModule {
  id: string;
  name: string;
  description?: string; 
  defaultConfig: PluginConfig;
  
  processNode?: (node: Node, response?: string) => { node: Node, result: any };
  generateNode?: (config: PluginConfig) => Node;
  transformEdge?: (edge: Edge, nodes: Record<string, Node>) => Edge;
  
  ConfigComponent: React.FC;
  ViewComponent: React.FC;
  ResultComponent: React.FC;
}