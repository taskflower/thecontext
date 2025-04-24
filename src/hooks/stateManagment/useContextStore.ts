// src/hooks/useContextStore.ts
import { create } from "zustand";
import { processTemplate } from "@/utils/byPath";
import { contextUtils } from "@/utils/contextUtils";
import { useWorkspaceStore } from "./useWorkspaceStore";

interface ContextState {
  contexts: Record<string, any>;
  setContexts: (contexts: Record<string, any>) => void;
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  updateByContextPath: (contextPath: string, value: any) => void;
  processTemplate: (template: string) => string;
  getContext: (path?: string) => any;
  getContextPath: (path: string) => any;
  hasContextPath: (path: string) => boolean;
}

export const useContextStore = create<ContextState>((set, get) => ({
  contexts: {},

  setContexts: (contexts) => {
    const currentContexts = get().contexts;

    if (contexts === currentContexts) return;

    let hasChanges = false;
    const allWorkspaceIds = new Set([
      ...Object.keys(currentContexts),
      ...Object.keys(contexts),
    ]);

    for (const workspaceId of allWorkspaceIds) {
      // Jeśli klucz istnieje tylko w jednym obiekcie, na pewno są zmiany
      if (!(workspaceId in currentContexts) || !(workspaceId in contexts)) {
        hasChanges = true;
        break;
      }

      if (
        JSON.stringify(currentContexts[workspaceId]) !==
        JSON.stringify(contexts[workspaceId])
      ) {
        hasChanges = true;
        break;
      }
    }

    if (hasChanges) {
      set({ contexts });
    }
  },

  updateContext: (key, value) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currWrkspId) return;

    set((state) => {
      const currentValue = state.contexts[currWrkspId]?.[key];
      if (JSON.stringify(currentValue) === JSON.stringify(value)) {
        return state;
      }

      return {
        contexts: contextUtils.updateWorkspaceContext(
          state.contexts,
          currWrkspId,
          key,
          value
        ),
      };
    });
  },

  updateContextPath: (key, jsonPath, value) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currWrkspId) return;

    set((state) => {
      const currCtx = state.contexts[currWrkspId] || {};
      const keyData = currCtx[key] ? { ...currCtx[key] } : {};
      const updtKeyData = contextUtils.setValueByPath(keyData, jsonPath, value);

      if (JSON.stringify(currCtx[key]) === JSON.stringify(updtKeyData)) {
        return state;
      }

      return {
        contexts: contextUtils.updateWorkspaceContext(
          state.contexts,
          currWrkspId,
          key,
          updtKeyData
        ),
      };
    });
  },

  updateByContextPath: (contextPath, value) => {
    if (!contextPath) return;

    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currWrkspId) return;

    const [key, ...rest] = contextPath.split(".");
    if (rest.length === 0) {
      get().updateContext(key, value);
    } else {
      get().updateContextPath(key, rest.join("."), value);
    }
  },

  processTemplate: (template) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    const ctx = currWrkspId ? get().contexts[currWrkspId] || {} : {};
    return processTemplate(template, ctx);
  },

  getContext: (path) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    const context = contextUtils.getContext(get().contexts, currWrkspId);
    if (!path) return context;
    return get().getContextPath(path);
  },

  getContextPath: (path) => {
    if (!path) return undefined;

    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    return contextUtils.getContextPath(get().contexts, currWrkspId, path);
  },

  hasContextPath: (path) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    return contextUtils.hasContextPath(get().contexts, currWrkspId, path);
  },
}));
