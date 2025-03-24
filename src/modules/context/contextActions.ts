// src/modules/context/contextActions.ts
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { ContextActions, ContextItem } from "./types";
import { AppState } from "../store";

export const createContextSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  ContextActions
> = (set, get) => ({
  getContextItems: () => {
    const state = get();
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    return workspace?.contextItems || [];
  },

  addContextItem: (payload: { title: string; content: string }) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      
      if (workspaceIndex !== -1) {
        if (!state.items[workspaceIndex].contextItems) {
          state.items[workspaceIndex].contextItems = [];
        }
        
        const newContextItem: ContextItem = {
          id: `context-${Date.now()}`,
          title: payload.title,
          content: payload.content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        state.items[workspaceIndex].contextItems.push(newContextItem);
        state.items[workspaceIndex].updatedAt = Date.now();
        state.stateVersion++;
      }
    }),

  updateContextItem: (id: string, payload: { title?: string; content?: string }) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      
      if (workspaceIndex !== -1 && state.items[workspaceIndex].contextItems) {
        const itemIndex = state.items[workspaceIndex].contextItems.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
          if (payload.title !== undefined) {
            state.items[workspaceIndex].contextItems[itemIndex].title = payload.title;
          }
          
          if (payload.content !== undefined) {
            state.items[workspaceIndex].contextItems[itemIndex].content = payload.content;
          }
          
          state.items[workspaceIndex].contextItems[itemIndex].updatedAt = Date.now();
          state.items[workspaceIndex].updatedAt = Date.now();
          state.stateVersion++;
        }
      }
    }),

  deleteContextItem: (id: string) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      
      if (workspaceIndex !== -1 && state.items[workspaceIndex].contextItems) {
        const itemIndex = state.items[workspaceIndex].contextItems.findIndex(item => item.id === id);
        
        if (itemIndex !== -1) {
          state.items[workspaceIndex].contextItems.splice(itemIndex, 1);
          state.items[workspaceIndex].updatedAt = Date.now();
          state.stateVersion++;
        }
      }
    }),
});