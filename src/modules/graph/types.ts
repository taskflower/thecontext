// src/modules/graph/types.ts
import { BaseItem, Position } from "../common/types";

export interface PluginDataMap {
  [pluginKey: string]: unknown;
}

export interface FlowNode extends BaseItem {
  label: string;
  assistantMessage: string; // Changed from 'value' to 'assistantMessage'
  userPrompt?: string;      // Added to store user input prompt
  position: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap; 
}

export interface Edge extends BaseItem {
  source: string;
  target: string;
  label?: string;
  type: string;
}

export interface NodeActions {
  selectNode: (nodeId: string) => void;
  addNode: (payload: NodePayload) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  setNodePlugin: (nodeId: string, pluginKey: string | null, initialData?: unknown) => void;
  updateNodePluginData: (nodeId: string, pluginKey: string, data: unknown) => void;
  getNodePluginData: (nodeId: string, pluginKey: string) => unknown;
}

export interface EdgeActions {
  addEdge: (payload: EdgePayload) => void;
  deleteEdge: (edgeId: string) => void;
}

export interface NodePayload {
  label: string;
  assistantMessage: string;     // Changed from 'value' to 'assistantMessage'
  userPrompt?: string;          // Added to store user input prompt
  position?: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap;
}

export interface EdgePayload {
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface FlowActions {
  getActiveScenarioData: () => { nodes: any[]; edges: any[] };
}