/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/graph/types.ts
import { PluginDataMap } from "../plugins/types";
import { BaseItem } from "../store";

// Position interface for nodes
export interface Position {
  x: number;
  y: number;
}

export interface FlowNode extends BaseItem {
  label: string;
  assistantMessage: string;
  userPrompt?: string;
  position: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap;
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
  updateNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateNodeAssistantMessage: (nodeId: string, message: string) => void;
}

export interface NodePayload {
  label: string;
  assistantMessage: string;
  userPrompt?: string;
  position?: Position;
  pluginKey?: string;
  pluginData?: PluginDataMap;
}

export interface Edge extends BaseItem {
  source: string;
  target: string;
  label?: string;
  type: string;
}

export interface EdgeActions {
  addEdge: (payload: EdgePayload) => void;
  deleteEdge: (edgeId: string) => void;
}

export interface EdgePayload {
  source: string;
  target: string;
  label?: string;
  type?: string;
}
