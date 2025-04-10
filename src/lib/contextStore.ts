// src/lib/contextStore.ts
import { create } from "zustand";
import { useAppStore } from "./store";

function getValueByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split(".");
  return keys.reduce((acc, key) => acc && acc[key], obj);
}

function setValueByPath(obj: Record<string, any>, path: string, value: any): Record<string, any> {
  const keys = path.split(".");
  let newObj = { ...obj };
  let current = newObj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    current[key] = current[key] ? { ...current[key] } : {};
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
  return newObj;
}

interface ContextState {
  contexts: Record<string, Record<string, any>>;
  activeWorkspaceId: string | null;
  setActiveWorkspace: (workspaceId: string) => void;
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  processTemplate: (template: string) => string;
  context: Record<string, any>;
}

export const useContextStore = create<ContextState>((set, get) => ({
  contexts: {},
  activeWorkspaceId: null,
  setActiveWorkspace: (workspaceId: string) => {
    console.log("[ContextStore] setActiveWorkspace called:", workspaceId);
    const state = get();
    if (!state.contexts[workspaceId]) {
      const { workspaces } = useAppStore.getState();
      const workspace = workspaces.find(w => w.id === workspaceId);
      if (workspace && workspace.initialContext) {
        const initialContextCopy = JSON.parse(JSON.stringify(workspace.initialContext));
        set({
          contexts: {
            ...state.contexts,
            [workspaceId]: initialContextCopy
          },
          activeWorkspaceId: workspaceId
        });
        console.log("[ContextStore] Context initialized (cloned) for:", workspaceId);
        return;
      }
    }
    set({ activeWorkspaceId: workspaceId });
    console.log("[ContextStore] Active workspace set:", workspaceId);
  },
  updateContext: (key, value) => {
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) {
      console.warn("[ContextStore] No active workspace, updateContext skipped.");
      return;
    }
    const currentContext = contexts[activeWorkspaceId] || {};
    set({
      contexts: {
        ...contexts,
        [activeWorkspaceId]: {
          ...currentContext,
          [key]: value
        }
      }
    });
    console.log("[ContextStore] Context updated for key:", key);
  },
  updateContextPath: (key, jsonPath, value) => {
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) {
      console.warn("[ContextStore] No active workspace, updateContextPath skipped.");
      return;
    }
    const currentContext = contexts[activeWorkspaceId] || {};
    const keyData = currentContext[key] ? { ...currentContext[key] } : {};
    const updatedKeyData = setValueByPath(keyData, jsonPath, value);
    set({
      contexts: {
        ...contexts,
        [activeWorkspaceId]: {
          ...currentContext,
          [key]: updatedKeyData
        }
      }
    });
    console.log("[ContextStore] Context path updated for:", key, jsonPath);
  },
  processTemplate: (template: string) => {
    if (!template) return "";
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) return template;
    const context = contexts[activeWorkspaceId] || {};
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const [key, ...pathParts] = path.trim().split(".");
      if (pathParts.length === 0) {
        const value = context[key];
        return value !== undefined ? String(value) : match;
      } else {
        const jsonPath = pathParts.join(".");
        const keyData = context[key];
        if (!keyData) return match;
        const value = getValueByPath(keyData, jsonPath);
        return value !== undefined ? String(value) : match;
      }
    });
  },
  get context() {
    const { activeWorkspaceId, contexts } = get();
    return activeWorkspaceId ? (contexts[activeWorkspaceId] || {}) : {};
  }
}));
