// src/modules/context/types.ts
import { ElementType } from "../types";

export type ContextValueType = 'text' | 'json';

export interface ContextItem {
  key: string;
  value: string; // Może zawierać zarówno tekst jak i serializowany JSON
  valueType: ContextValueType;
}

export interface Context {
  id: string;
  type: ElementType.CONTEXT;
  name: string;
  workspaceId: string; // Powiązanie z workspace
  items: ContextItem[];
  createdAt: number;
  updatedAt: number;
}

// Rozszerzenie AppState o kontekst
export interface ContextState {
  contexts: Context[];
  selectedContext?: string;
  
  // Metody kontekstowe
  selectContext: (contextId: string) => void;
  addContext: (payload: { name: string; workspaceId: string; }) => void;
  updateContext: (contextId: string, payload: { name?: string; items?: ContextItem[] }) => void;
  deleteContext: (contextId: string) => void;
  
  // Metody pomocnicze
  addContextItem: (contextId: string, item: ContextItem) => void;
  updateContextItem: (contextId: string, key: string, value: string, valueType: ContextValueType) => void;
  deleteContextItem: (contextId: string, key: string) => void;
  getContextByWorkspace: (workspaceId: string) => Context | undefined;
  getContextValueByKey: (workspaceId: string, key: string) => ContextItem | undefined;
  filterByContext: (workspaceId: string, filterKey: string, filterValue: string) => boolean;
}