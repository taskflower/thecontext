/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/app.ts
import { Node as ReactFlowNode, Edge as ReactFlowEdgeType } from 'reactflow';

export enum ElementType {
  WORKSPACE = 'workspace',
  SCENARIO = 'scenario',
  GRAPH_NODE = 'node' // Changed ElementType.NODE to GRAPH_NODE
}

export type Position = {
  x: number;
  y: number;
};

export type FormData = {
  [key: string]: string | number;
};

export interface DialogField {
  name: string;
  placeholder: string;
  type?: string;
  options?: { value: string; label: string }[];
}

// Renamed Node to GraphNode to avoid conflicts with built-in Node type
export interface GraphNode {
  id: string;
  type: ElementType.GRAPH_NODE;
  label: string;
  value: number;
  position: Position;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface Scenario {
  id: string;
  type: ElementType.SCENARIO;
  name: string;
  description?: string;
  children: GraphNode[]; 
  edges: GraphEdge[]; 
}

export interface Workspace {
  id: string;
  type: ElementType.WORKSPACE;
  title: string;
  children: Scenario[];
}

export interface AppState {
  items: Workspace[];
  selected: {
    workspace: string;
    scenario: string;
  };
  stateVersion: number;
}

export type ReactFlowEdge = ReactFlowEdgeType<any>;

export interface FlowData {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
}