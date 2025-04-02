// src/modules/graph/types.ts
import { PluginDataMap } from "../plugins/types";
import { BaseItem, ItemType } from "../store";

// Position interface for nodes
export interface Position {
  x: number;
  y: number;
}

export interface FlowNode extends BaseItem {
  label: string;
  description?: string; // Dodane pole opisu
  assistantMessage: string;
  userPrompt?: string;
  position: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap;
  contextKey?: string; // Added field for context
}

export interface NodeActions {
  selectNode: (nodeId: string) => void;
  addNode: (payload: NodePayload) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  setNodePlugin: (
    nodeId: string,
    pluginKey: string | null,
    initialData?: unknown
  ) => void;
  updateNodePluginData: (
    nodeId: string,
    pluginKey: string,
    data: unknown
  ) => void;
  getNodePluginData: (nodeId: string, pluginKey: string) => unknown;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeDescription: (nodeId: string, description: string) => void; // Dodana metoda
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
  updateNodeContextKey: (nodeId: string, contextKey: string) => void; // Added method
}

export interface NodePayload {
  label: string;
  description?: string; // Dodane pole opisu
  assistantMessage: string;
  userPrompt?: string;
  position?: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap;
  contextKey?: string; // Added field for context
}

export interface Edge extends BaseItem {
  source: string;
  target: string;
  label?: string;
  type: ItemType;
}

export interface EdgeActions {
  addEdge: (payload: EdgePayload) => void;
  deleteEdge: (edgeId: string) => void;
  updateEdgeLabel: (edgeId: string, label: string) => void;
}

export interface EdgePayload {
  source: string;
  target: string;
  label?: string;
  type?: ItemType;
}