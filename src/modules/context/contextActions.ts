/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/context/contextActions.ts
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { ContextActions, ContextItem, ContextPayload, ContextType } from "./types";
import { AppState } from "../store";
import { detectContentType } from "./utils";

/* memo stabilizator */
const EMPTY_ARRAY: any[] = [];

export const createContextSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  ContextActions
> = (set, get) => ({
  getContextItems: (scenarioId) => {
    const state = get();
    const workspace = state.items.find(
      (w) => w.id === state.selected.workspace
    );
    
    if (!workspace?.contextItems) return EMPTY_ARRAY;
    
    // Jeśli podano scenarioId, filtruj konteksty powiązane z tym scenariuszem
    // lub te, które nie są powiązane z żadnym scenariuszem (globalne)
    if (scenarioId) {
      return workspace.contextItems.filter(
        item => !item.scenarioId || item.scenarioId === scenarioId
      );
    }
    
    return workspace.contextItems || EMPTY_ARRAY;
  },

  getContextItemByTitle: (title: string) => {
    const items = get().getContextItems();
    return items.find(item => item.title === title);
  },

  addContextItem: (payload: ContextPayload) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(
        (w) => w.id === state.selected.workspace
      );

      if (workspaceIndex !== -1) {
        if (!state.items[workspaceIndex].contextItems) {
          state.items[workspaceIndex].contextItems = [];
        }

        // Automatyczne wykrywanie typu, jeśli nie podano
        let type = payload.type;
        if (!type) {
          const detectedType = detectContentType(payload.content);
          type = detectedType.type === 'json' ? ContextType.JSON : ContextType.TEXT;
        }

        const newContextItem: ContextItem = {
          id: `context-${Date.now()}`,
          title: payload.title,
          type: type,
          content: payload.content,
          scenarioId: payload.scenarioId,
          metadata: payload.metadata || {},
          persistent: payload.persistent || false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        state.items[workspaceIndex].contextItems.push(newContextItem);
        state.items[workspaceIndex].updatedAt = Date.now();
        state.stateVersion++;
      }
    }),

  updateContextItem: (
    id: string,
    payload: Partial<ContextPayload>
  ) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(
        (w) => w.id === state.selected.workspace
      );

      if (workspaceIndex !== -1 && state.items[workspaceIndex].contextItems) {
        const itemIndex = state.items[workspaceIndex].contextItems.findIndex(
          (item) => item.id === id
        );

        if (itemIndex !== -1) {
          const contextItem = state.items[workspaceIndex].contextItems[itemIndex];
          
          if (payload.title !== undefined) {
            contextItem.title = payload.title;
          }

          if (payload.content !== undefined) {
            contextItem.content = payload.content;
            
            // Automatyczna aktualizacja typu, jeśli zmienia się zawartość
            if (!payload.type) {
              const detectedType = detectContentType(payload.content);
              if (detectedType.type === 'json') {
                contextItem.type = ContextType.JSON;
              }
            }
          }
          
          if (payload.type !== undefined) {
            contextItem.type = payload.type;
          }
          
          if (payload.scenarioId !== undefined) {
            contextItem.scenarioId = payload.scenarioId;
          }
          
          if (payload.metadata !== undefined) {
            contextItem.metadata = {
              ...contextItem.metadata,
              ...payload.metadata
            };
          }
          
          if (payload.persistent !== undefined) {
            contextItem.persistent = payload.persistent;
          }

          contextItem.updatedAt = Date.now();
          state.items[workspaceIndex].updatedAt = Date.now();
          state.stateVersion++;
        }
      }
    }),

  deleteContextItem: (id: string) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(
        (w) => w.id === state.selected.workspace
      );

      if (workspaceIndex !== -1 && state.items[workspaceIndex].contextItems) {
        const itemIndex = state.items[workspaceIndex].contextItems.findIndex(
          (item) => item.id === id
        );

        if (itemIndex !== -1) {
          state.items[workspaceIndex].contextItems.splice(itemIndex, 1);
          state.items[workspaceIndex].updatedAt = Date.now();
          state.stateVersion++;
        }
      }
    }),
});