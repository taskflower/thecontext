/* eslint-disable @typescript-eslint/no-explicit-any */
import { BaseItem, Position } from "../common/types";

export interface FlowNode extends BaseItem {
  label: string;
  value: number;
  position: Position;
  pluginKey?: string; // Add this line to store plugin reference
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
  setNodePlugin: (nodeId: string, pluginKey: string | null) => void; // Add this line
}

export interface EdgeActions {
  addEdge: (payload: EdgePayload) => void;
  deleteEdge: (edgeId: string) => void;
}

export interface NodePayload {
  label: string;
  value: string | number;
  position?: Position;
  pluginKey?: string; // Add this line
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