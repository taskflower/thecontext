/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flow/types.ts
import { ElementType, Position } from "../types";

export interface FlowNode {
  id: string;
  type: ElementType.GRAPH_NODE;
  label: string;
  assistant: string;
  position: Position;
  plugin?: string;
  pluginOptions?: { [pluginId: string]: Record<string, any> };
  userMessage?: string;
  contextSaveKey?: string; // Klucz kontekstu, do którego zostanie zapisana odpowiedź użytkownika
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}