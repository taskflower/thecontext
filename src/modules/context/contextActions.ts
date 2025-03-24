// src/modules/context/contextActions.ts

import { StateCreator } from "zustand";
import { Draft } from "immer";
import { ContextItem } from "./types";
import { AppState, ContextActions } from "../store";

export const createContextActions: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  ContextActions
> = (set) => ({
  addContextItem: (workspaceId: string, item: ContextItem) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace) return;
      
      if (!workspace.contextItems) {
        workspace.contextItems = [];
      }
      
      // Sprawdź, czy klucz już istnieje i zastąp go
      const existingIndex = workspace.contextItems.findIndex(i => i.key === item.key);
      if (existingIndex !== -1) {
        workspace.contextItems[existingIndex] = item;
      } else {
        workspace.contextItems.push(item);
      }
      
      workspace.updatedAt = Date.now();
      state.stateVersion++;
    }),
    
  updateContextItem: (workspaceId: string, key: string, value: string, valueType: 'text' | 'json') =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace || !workspace.contextItems) return;
      
      const item = workspace.contextItems.find(i => i.key === key);
      if (item) {
        item.value = value;
        item.valueType = valueType;
        workspace.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  deleteContextItem: (workspaceId: string, key: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(w => w.id === workspaceId);
      if (!workspace || !workspace.contextItems) return;
      
      const index = workspace.contextItems.findIndex(i => i.key === key);
      if (index !== -1) {
        workspace.contextItems.splice(index, 1);
        workspace.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  getContextValue: (workspaceId: string, key: string) => (state: AppState) => {
    const workspace = state.items.find(w => w.id === workspaceId);
    if (!workspace || !workspace.contextItems) return null;
    
    const item = workspace.contextItems.find(i => i.key === key);
    return item ? item.value : null;
  },
  
  getContextItems: (workspaceId: string) => (state: AppState) => {
    const workspace = state.items.find(w => w.id === workspaceId);
    return workspace && workspace.contextItems ? workspace.contextItems : [];
  },
});