// src/lib/contextStore.ts
import { create } from 'zustand';
import { useAppStore } from './store';

// Funkcja pomocnicza do pobierania wartości z zagnieżdżonej ścieżki
function getValueByPath(obj: Record<string, any>, path: string): any {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === undefined || current === null) {
      return undefined;
    }
    current = current[key];
  }
  
  return current;
}

// Funkcja pomocnicza do ustawiania wartości pod zagnieżdżoną ścieżką
function setValueByPath(obj: Record<string, any>, path: string, value: any): Record<string, any> {
  // Klonujemy obiekt, aby uniknąć mutacji
  const result = { ...obj };
  const keys = path.split('.');
  
  // Jeśli ścieżka jest pusta, zwracamy po prostu wartość
  if (keys.length === 0) {
    return value;
  }
  
  let current = result;
  
  // Przechodzimy przez wszystkie klucze oprócz ostatniego
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // Jeśli klucz nie istnieje lub nie jest obiektem, tworzymy nowy
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  // Ustawiamy wartość pod ostatnim kluczem
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
  
  return result;
}

interface ContextState {
  // Mapa kontekstów dla poszczególnych workspace'ów
  contexts: Record<string, Record<string, any>>;
  
  // Aktualnie aktywny workspace
  activeWorkspaceId: string | null;
  
  // Akcje
  setActiveWorkspace: (workspaceId: string) => void;
  
  setContext: (context: Record<string, any>) => void;
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  processTemplate: (template: string) => string;
  
  // Gettery
  getContextValue: (key: string) => any;
  getContextPathValue: (key: string, jsonPath: string) => any;
  
  // Getter dla całego kontekstu aktywnego workspace'a
  context: Record<string, any>;
}

export const useContextStore = create<ContextState>((set, get) => ({
  contexts: {},
  activeWorkspaceId: null,
  
  // Ustawia aktywny workspace
  setActiveWorkspace: (workspaceId) => {
    console.log("setActiveWorkspace called with:", workspaceId);
    
    // Pobierz aktualny stan
    const currentState = get();
    console.log("Current contextStore state:", {
      activeWorkspaceId: currentState.activeWorkspaceId,
      hasContexts: Object.keys(currentState.contexts).length > 0,
      contextKeys: Object.keys(currentState.contexts)
    });
    
    // Sprawdź, czy mamy już kontekst dla tego workspace'a
    const hasExistingContext = !!currentState.contexts[workspaceId];
    console.log("Has existing context for this workspace:", hasExistingContext);
    
    // Jeśli nie mamy kontekstu dla tego workspace'a, znajdź initialContext
    if (!hasExistingContext) {
      const { workspaces } = useAppStore.getState();
      console.log("Total workspaces in appStore:", workspaces.length);
      
      const workspace = workspaces.find(w => w.id === workspaceId);
      console.log("Found workspace:", workspace ? workspace.id : "none");
      
      if (workspace && workspace.initialContext) {
        console.log("Workspace has initialContext:", Object.keys(workspace.initialContext));
        
        // Inicjalizuj kontekst dla tego workspace'a
        const newState = {
          activeWorkspaceId: workspaceId,
          contexts: {
            ...currentState.contexts,
            [workspaceId]: JSON.parse(JSON.stringify(workspace.initialContext))
          }
        };
        
        console.log("Setting new state with initialized context:", {
          activeWorkspaceId: newState.activeWorkspaceId,
          contextsKeys: Object.keys(newState.contexts),
          newContextKeys: newState.contexts[workspaceId] ? Object.keys(newState.contexts[workspaceId]) : []
        });
        
        // Zaktualizuj stan
        set(newState);
        return;
      } else {
        console.log("Workspace not found or has no initialContext");
      }
    }
    
    // Jeśli już mamy kontekst lub nie znaleziono initialContext, po prostu zaktualizuj activeWorkspaceId
    console.log("Just updating activeWorkspaceId to:", workspaceId);
    set({ activeWorkspaceId: workspaceId });
  },
  
  // Getter dla aktualnego kontekstu (dla kompatybilności)
  get context() {
    const { activeWorkspaceId, contexts } = get();
    const result = activeWorkspaceId ? (contexts[activeWorkspaceId] || {}) : {};
    console.log("Getting context for activeWorkspaceId:", activeWorkspaceId, "result keys:", Object.keys(result));
    return result;
  },
  
  // Ustawia pełny kontekst dla aktywnego workspace'a
  setContext: (context) => {
    console.log("setContext called with keys:", Object.keys(context));
    set(state => {
      if (!state.activeWorkspaceId) {
        console.log("No activeWorkspaceId, cannot set context");
        return state;
      }
      
      console.log("Setting entire context for workspace:", state.activeWorkspaceId);
      return {
        contexts: {
          ...state.contexts,
          [state.activeWorkspaceId]: JSON.parse(JSON.stringify(context))
        }
      };
    });
  },
  
  // Aktualizuje wartość całego klucza
  updateContext: (key, value) => {
    console.log("updateContext called for key:", key);
    set(state => {
      if (!state.activeWorkspaceId) {
        console.log("No activeWorkspaceId, cannot update context");
        return state;
      }
      
      const currentContext = state.contexts[state.activeWorkspaceId] || {};
      console.log("Current context keys:", Object.keys(currentContext));
      console.log("Updating context key:", key);
      
      return {
        contexts: {
          ...state.contexts,
          [state.activeWorkspaceId]: {
            ...currentContext,
            [key]: value
          }
        }
      };
    });
  },
  
  // Aktualizuje wartość w konkretnej ścieżce, np. "userProfile.firstName"
  updateContextPath: (key, jsonPath, value) => {
    console.log(`updateContextPath called for ${key}.${jsonPath} with value:`, value);
    set(state => {
      if (!state.activeWorkspaceId) {
        console.log("No activeWorkspaceId, cannot update context path");
        return state;
      }
      
      const currentContext = state.contexts[state.activeWorkspaceId] || {};
      console.log("Current context keys:", Object.keys(currentContext));
      
      const keyData = { ...(currentContext[key] || {}) };
      console.log(`Current data for key ${key}:`, keyData);
      
      // Ustawiamy wartość w danej ścieżce
      const updatedKeyData = setValueByPath(keyData, jsonPath, value);
      console.log(`Updated data for key ${key}:`, updatedKeyData);
      
      // Zwracamy zaktualizowany kontekst
      return {
        contexts: {
          ...state.contexts,
          [state.activeWorkspaceId]: {
            ...currentContext,
            [key]: updatedKeyData
          }
        }
      };
    });
  },
  
  // Pobiera wartość dla danego klucza
  getContextValue: (key) => {
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) return undefined;
    
    const currentContext = contexts[activeWorkspaceId] || {};
    const value = currentContext[key];
    console.log(`getContextValue for key ${key}:`, value);
    return value;
  },
  
  // Pobiera wartość z danej ścieżki
  getContextPathValue: (key, jsonPath) => {
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) return undefined;
    
    const currentContext = contexts[activeWorkspaceId] || {};
    const keyData = currentContext[key];
    if (!keyData) return undefined;
    
    const value = getValueByPath(keyData, jsonPath);
    console.log(`getContextPathValue for ${key}.${jsonPath}:`, value);
    return value;
  },
  
  // Przetwarza szablon, zastępując zmienne w formacie {{key.path}} wartościami z kontekstu
  processTemplate: (template) => {
    if (!template) return '';
    
    console.log("Processing template:", template);
    
    // Regexp do wyszukiwania zmiennych w formacie {{nazwa.ścieżka}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    return template.replace(variableRegex, (match, path) => {
      // Sprawdzamy, czy ścieżka zawiera kropkę (oznacza to zagnieżdżoną ścieżkę)
      const [key, ...pathParts] = path.trim().split('.');
      
      if (pathParts.length === 0) {
        // Jeśli nie ma zagnieżdżenia, pobieramy wartość bezpośrednio
        const value = get().getContextValue(key);
        console.log(`Template variable ${match} -> ${value !== undefined ? String(value) : match}`);
        return value !== undefined ? String(value) : match;
      } else {
        // Jeśli jest zagnieżdżenie, używamy getContextPathValue
        const jsonPath = pathParts.join('.');
        const value = get().getContextPathValue(key, jsonPath);
        console.log(`Template variable ${match} -> ${value !== undefined ? String(value) : match}`);
        return value !== undefined ? String(value) : match;
      }
    });
  }
}));