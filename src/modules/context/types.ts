// src/modules/context/types.ts

import { AppState } from "../store";

export type ContextValueType = "text" | "json";

export interface ContextItem {
  key: string;
  value: string; 
  valueType: ContextValueType;
}

export interface ContextActions {
  addContextItem: (workspaceId: string, item: ContextItem) => void;
  updateContextItem: (
    workspaceId: string,
    key: string,
    value: string,
    valueType: "text" | "json"
  ) => void;
  deleteContextItem: (workspaceId: string, key: string) => void;
  getContextValue: (
    workspaceId: string,
    key: string
  ) => (state: AppState) => string | null;
  getContextItems: (workspaceId: string) => (state: AppState) => ContextItem[];
}
