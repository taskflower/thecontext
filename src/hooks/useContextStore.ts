// src/hooks/useContextStore.ts
import { create } from 'zustand';
import { getValueByPath, setValueByPath, processTemplate } from '@/lib/byPath';
import { useWorkspaceStore } from './useWorkspaceStore';

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

  setContexts: (contexts) => set({ contexts }),

  updateContext: (key, value) => {
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currentWorkspaceId) return;
    set(state => ({
      contexts: {
        ...state.contexts,
        [currentWorkspaceId]: {
          ...state.contexts[currentWorkspaceId],
          [key]: value,
        },
      },
    }));
  },

  updateContextPath: (key, jsonPath, value) => {
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currentWorkspaceId) return;

    const currentContext = get().contexts[currentWorkspaceId] || {};
    const keyData = currentContext[key] ? { ...currentContext[key] } : {};
    const updatedKeyData = setValueByPath(keyData, jsonPath, value);

    set(state => ({
      contexts: {
        ...state.contexts,
        [currentWorkspaceId]: {
          ...state.contexts[currentWorkspaceId],
          [key]: updatedKeyData,
        },
      },
    }));
  },

  updateByContextPath: (contextPath, value) => {
    if (!contextPath) return;
    const [key, ...rest] = contextPath.split('.');
    if (rest.length === 0) {
      get().updateContext(key, value);
    } else {
      get().updateContextPath(key, rest.join('.'), value);
    }
  },

  processTemplate: (template) => {
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    const context = currentWorkspaceId 
      ? get().contexts[currentWorkspaceId] || {} 
      : {};
    return processTemplate(template, context);
  },

  getContext: (path) => {
    const currentWorkspaceId = useWorkspaceStore.getState().currentWorkspaceId;
    const context = currentWorkspaceId ? get().contexts[currentWorkspaceId] || {} : {};
    if (!path) return context;
    return get().getContextPath(path);
  },

  getContextPath: (path) => {
    if (!path) return undefined;
    const context = get().getContext();
    return getValueByPath(context, path);
  },

  hasContextPath: (path) => {
    const val = get().getContextPath(path);
    return val !== undefined && val !== null;
  },
}));