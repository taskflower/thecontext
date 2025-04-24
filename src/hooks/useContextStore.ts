// src/hooks/useContextStore.ts
import { create } from "zustand";
import { getValueByPath, setValueByPath, processTemplate } from "@/utils/byPath";
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
  
  // Poprawiona funkcja setContexts, aby unikać nieskończonych pętli aktualizacji
  setContexts: (contexts) => {
    // Sprawdź, czy naprawdę trzeba aktualizować stan
    // Jeśli konteksty są identyczne, nie rób niczego
    const currentContexts = get().contexts;
    
    // Szybkie porównanie referencji
    if (contexts === currentContexts) return;
    
    // Porównanie kluczy i wartości
    let hasChanges = false;
    const allKeys = new Set([
      ...Object.keys(currentContexts), 
      ...Object.keys(contexts)
    ]);
    
    for (const key of allKeys) {
      // Jeśli klucz istnieje tylko w jednym obiekcie lub wartości się różnią
      if (
        !(key in currentContexts) || 
        !(key in contexts) ||
        JSON.stringify(currentContexts[key]) !== JSON.stringify(contexts[key])
      ) {
        hasChanges = true;
        break;
      }
    }
    
    // Aktualizuj stan tylko jeśli są zmiany
    if (hasChanges) {
      set({ contexts });
    }
  },
  
  updateContext: (key, value) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currWrkspId) return;
    
    set((state) => {
      // Sprawdź, czy wartość faktycznie się zmienia
      const currentValue = state.contexts[currWrkspId]?.[key];
      if (JSON.stringify(currentValue) === JSON.stringify(value)) {
        return state; // Jeśli wartość się nie zmieniła, zwróć aktualny stan
      }
      
      // W przeciwnym przypadku aktualizuj stan
      return {
        contexts: {
          ...state.contexts,
          [currWrkspId]: {
            ...state.contexts[currWrkspId],
            [key]: value,
          },
        },
      };
    });
  },

  updateContextPath: (key, jsonPath, value) => {
    const currWrkspId = useWorkspaceStore.getState().currentWorkspaceId;
    if (!currWrkspId) return;

    const currCtx = get().contexts[currWrkspId] || {};
    const keyData = currCtx[key] ? { ...currCtx[key] } : {};
    const updtKeyData = setValueByPath(keyData, jsonPath, value);
    
    // Sprawdź, czy wartość faktycznie się zmieniła
    if (JSON.stringify(currCtx[key]) === JSON.stringify(updtKeyData)) {
      return; // Jeśli wartość się nie zmieniła, nic nie rób
    }

    set((state) => ({
      contexts: {
        ...state.contexts,
        [currWrkspId]: {
          ...state.contexts[currWrkspId],
          [key]: updtKeyData,
        },
      },
    }));
  },

  updateByContextPath: (contextPath, value) => {
    if (!contextPath) return;
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
    const context = currWrkspId ? get().contexts[currWrkspId] || {} : {};
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