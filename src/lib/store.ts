// src/lib/store.ts
import { create } from 'zustand';
import { Scenario, TemplateSettings } from '../views/types';
import { getValueByPath, setValueByPath } from './byPath';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext: Record<string, any>;
}

interface AppState {
  // Podstawowe dane o workspaces
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentScenarioId: string | null;

  // Konteksty dla poszczególnych workspaces
  contexts: Record<string, Record<string, any>>;
  
  // Funkcje do zarządzania workspaces i scenariuszami
  setInitialWorkspaces: (workspaces: Workspace[]) => void;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  
  // Funkcje pomocnicze do pobierania aktualnych danych
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
  
  // Funkcje do zarządzania kontekstem
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  updateByContextPath: (contextPath: string, value: any) => void; // Nowa funkcja
  processTemplate: (template: string) => string;
  getContext: () => Record<string, any>;
  getContextPath: (path: string) => any;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Podstawowy stan
  workspaces: [],
  currentWorkspaceId: null,
  currentScenarioId: null,
  contexts: {},
  
  // Inicjalizacja workspaces
  setInitialWorkspaces: (workspaces) => {
    // Inicjalizujemy konteksty dla wszystkich workspaces
    const contexts: Record<string, Record<string, any>> = {};
    
    workspaces.forEach(workspace => {
      if (workspace.initialContext) {
        // Tworzymy głęboką kopię initialContext
        contexts[workspace.id] = JSON.parse(JSON.stringify(workspace.initialContext));
      } else {
        contexts[workspace.id] = {};
      }
    });
    
    set({ 
      workspaces,
      contexts
    });
    
    console.log("[AppStore] Initial workspaces set:", workspaces.length);
    
    // Jeśli mamy workspaces, wybieramy pierwszy jako domyślny
    if (workspaces.length > 0) {
      get().selectWorkspace(workspaces[0].id);
    }
  },
  
  // Wybór workspace'a
  selectWorkspace: (id) => {
    const { contexts, workspaces } = get();
    
    // Sprawdzamy czy kontekst dla tego workspace'a istnieje
    if (!contexts[id]) {
      // Jeśli nie, inicjalizujemy go z initialContext workspace'a
      const workspace = workspaces.find(w => w.id === id);
      
      if (workspace && workspace.initialContext) {
        const initialContextCopy = JSON.parse(JSON.stringify(workspace.initialContext));
        set(state => ({
          contexts: {
            ...state.contexts,
            [id]: initialContextCopy
          }
        }));
      } else {
        // Jeśli nie ma initialContext, tworzymy pusty obiekt
        set(state => ({
          contexts: {
            ...state.contexts,
            [id]: {}
          }
        }));
      }
    }
    
    set({ currentWorkspaceId: id, currentScenarioId: null });
  },
  
  // Wybór scenariusza
  selectScenario: (id) => set({ currentScenarioId: id }),
  
  // Pobieranie aktualnego workspace'a
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },
  
  // Pobieranie aktualnego scenariusza
  getCurrentScenario: () => {
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios.find(s => s.id === get().currentScenarioId);
  },
  
  // Aktualizacja całego klucza kontekstu
  updateContext: (key, value) => {
    const { currentWorkspaceId, contexts } = get();
    if (!currentWorkspaceId) {
      return;
    }
    
    const currentContext = contexts[currentWorkspaceId] || {};
    set({
      contexts: {
        ...contexts,
        [currentWorkspaceId]: {
          ...currentContext,
          [key]: value
        }
      }
    });
  },
  
  // Aktualizacja konkretnej ścieżki w kontekście
  updateContextPath: (key, jsonPath, value) => {
    const { currentWorkspaceId, contexts } = get();
    if (!currentWorkspaceId) {
      return;
    }
    
    const currentContext = contexts[currentWorkspaceId] || {};
    const keyData = currentContext[key] ? { ...currentContext[key] } : {};
    const updatedKeyData = setValueByPath(keyData, jsonPath, value);
    
    set({
      contexts: {
        ...contexts,
        [currentWorkspaceId]: {
          ...currentContext,
          [key]: updatedKeyData
        }
      }
    });
  },
  
  // Nowa funkcja - aktualizacja kontekstu za pomocą pojedynczej ścieżki
  updateByContextPath: (contextPath, value) => {
    if (!contextPath) {
      return;
    }
    
    const parts = contextPath.split('.');
    const key = parts[0];
    
    if (parts.length === 1) {
      // Przypadek prosty - aktualizacja całego klucza
      get().updateContext(key, value);
    } else {
      // Przypadek złożony - aktualizacja zagnieżdżonej ścieżki
      const jsonPath = parts.slice(1).join('.');
      get().updateContextPath(key, jsonPath, value);
    }
  },
  
  // Przetwarzanie szablonów z wartościami z kontekstu
  processTemplate: (template: string) => {
    if (!template) return "";
    
    const { currentWorkspaceId, contexts } = get();
    if (!currentWorkspaceId) return template;
    
    const context = contexts[currentWorkspaceId] || {};
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
  
  // Getter dla aktualnego kontekstu
  // Może być wywołany bez parametrów (zwraca cały kontekst) 
  // lub z parametrem ścieżki (zwraca wartość pod określoną ścieżką)
  getContext: (path?: string) => {
    const { currentWorkspaceId, contexts } = get();
    const context = currentWorkspaceId ? (contexts[currentWorkspaceId] || {}) : {};
    
    // Jeśli ścieżka nie jest podana, zwróć cały kontekst
    if (!path) return context;
    
    // W przeciwnym razie wywołaj getContextPath
    return get().getContextPath(path);
  },
  
  // Getter dla wartości w ścieżce kontekstu
  getContextPath: (path: string) => {
    const context = get().getContext();
    if (!context || !path) return undefined;
    
    // Normalizujemy ścieżkę
    const normalizedPath = path.trim();
    if (!normalizedPath) return undefined;
    
    // Rozdzielamy ścieżkę na części
    const parts = normalizedPath.split('.');
    
    // Jeśli mamy tylko jeden element, zwracamy bezpośrednio z kontekstu
    if (parts.length === 1) {
      return context[parts[0]];
    }
    
    // W przeciwnym razie używamy getValueByPath
    return getValueByPath(context, normalizedPath);
  },
  
  // Sprawdza czy ścieżka istnieje w kontekście
  hasContextPath: (path: string) => {
    if (!path) return false;
    
    const value = get().getContextPath(path);
    return value !== undefined && value !== null;
  },
  
  // Pobiera schemat z kontekstu, odpowiedni dla typu komponentu
  getSchemaForType: (type: string, schemaPath: string) => {
    if (!type || !schemaPath) return null;
    
    // Mapuj typy komponentów na namespace schematu
    let schemaNamespace = '';
    if (type === 'form') {
      schemaNamespace = 'formSchemas';
    } else if (type === 'llm') {
      schemaNamespace = 'llmSchemas';
    } else {
      return null; // Nieobsługiwany typ schematu
    }
    
    // Pobierz schemat z kontekstu
    const schema = get().getContextPath(`${schemaNamespace}.${schemaPath}`);
    if (!schema) {
      console.warn(`Schema not found for ${type}: ${schemaPath}`);
      return null;
    }
    
    return {
      type,
      path: schemaPath,
      schema
    };
  }
}));