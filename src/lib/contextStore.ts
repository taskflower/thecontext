// lib/contextStore.ts
// Oto jak powinien wyglądać poprawiony store kontekstu w Twojej aplikacji

import { create } from 'zustand';
import { useAppStore } from './store';

// Funkcja pomocnicza do pobierania wartości z zagnieżdżonej ścieżki
function getValueByPath(obj: Record<string, any>, path: string): any {
  if (!obj) return undefined;
  
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
  
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  processTemplate: (template: string) => string;
  
  // Getter dla całego kontekstu aktywnego workspace'a
  context: Record<string, any>;
}

export const useContextStore = create<ContextState>((set, get) => ({
  contexts: {},
  activeWorkspaceId: null,
  
  // Ustawia aktywny workspace i inicjalizuje kontekst jeśli potrzeba
  setActiveWorkspace: (workspaceId) => {
    console.log("[ContextStore] setActiveWorkspace:", workspaceId);
    
    const state = get();
    const hasExistingContext = !!state.contexts[workspaceId];
    
    // Jeśli nie mamy kontekstu dla tego workspace'a, pobierz initialContext
    if (!hasExistingContext) {
      console.log("[ContextStore] Brak istniejącego kontekstu, inicjalizacja z initialContext");
      
      const { workspaces } = useAppStore.getState();
      const workspace = workspaces.find(w => w.id === workspaceId);
      
      if (workspace?.initialContext) {
        console.log("[ContextStore] Znaleziono initialContext:", Object.keys(workspace.initialContext));
        
        // Deep clone aby uniknąć referencji
        const initialContextCopy = JSON.parse(JSON.stringify(workspace.initialContext));
        
        // Ustaw nowy stan z zainicjalizowanym kontekstem
        set({
          activeWorkspaceId: workspaceId,
          contexts: {
            ...state.contexts,
            [workspaceId]: initialContextCopy
          }
        });
        
        console.log("[ContextStore] Kontekst zainicjalizowany dla:", workspaceId);
        return;
      }
    }
    
    // Jeśli już mamy kontekst lub nie znaleziono initialContext
    console.log("[ContextStore] Ustawiono activeWorkspaceId:", workspaceId);
    set({ activeWorkspaceId: workspaceId });
  },
  
  // Getter dla aktualnego kontekstu
  get context() {
    const { activeWorkspaceId, contexts } = get();
    const result = activeWorkspaceId ? (contexts[activeWorkspaceId] || {}) : {};
    console.log("[ContextStore] Pobieranie kontekstu dla workspace:", activeWorkspaceId);
    return result;
  },
  
  // Aktualizuje wartość całego klucza
  updateContext: (key, value) => {
    console.log("[ContextStore] updateContext dla klucza:", key);
    
    const { activeWorkspaceId, contexts } = get();
    
    if (!activeWorkspaceId) {
      console.warn("[ContextStore] Brak aktywnego workspace, nie można zaktualizować kontekstu");
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
    
    console.log("[ContextStore] Kontekst zaktualizowany dla klucza:", key);
  },
  
  // Aktualizuje wartość w konkretnej ścieżce, np. "userProfile.firstName"
  updateContextPath: (key, jsonPath, value) => {
    console.log(`[ContextStore] updateContextPath dla ${key}.${jsonPath}:`, value);
    
    const { activeWorkspaceId, contexts } = get();
    
    if (!activeWorkspaceId) {
      console.warn("[ContextStore] Brak aktywnego workspace, nie można zaktualizować ścieżki kontekstu");
      return;
    }
    
    const currentContext = contexts[activeWorkspaceId] || {};
    const keyData = { ...(currentContext[key] || {}) };
    
    // Ustawiamy wartość w danej ścieżce
    const updatedKeyData = setValueByPath(keyData, jsonPath, value);
    
    // Zwracamy zaktualizowany kontekst
    set({
      contexts: {
        ...contexts,
        [activeWorkspaceId]: {
          ...currentContext,
          [key]: updatedKeyData
        }
      }
    });
    
    console.log(`[ContextStore] Kontekst zaktualizowany dla ścieżki ${key}.${jsonPath}`);
  },
  
  // Przetwarza szablon, zastępując zmienne w formacie {{key.path}} wartościami z kontekstu
  processTemplate: (template) => {
    if (!template) return '';
    
    console.log("[ContextStore] Przetwarzanie szablonu:", template);
    
    const { activeWorkspaceId, contexts } = get();
    if (!activeWorkspaceId) return template;
    
    const context = contexts[activeWorkspaceId] || {};
    
    // Regexp do wyszukiwania zmiennych w formacie {{nazwa.ścieżka}}
    const variableRegex = /\{\{([^}]+)\}\}/g;
    
    return template.replace(variableRegex, (match, path) => {
      // Sprawdzamy, czy ścieżka zawiera kropkę (oznacza to zagnieżdżoną ścieżkę)
      const [key, ...pathParts] = path.trim().split('.');
      
      if (pathParts.length === 0) {
        // Jeśli nie ma zagnieżdżenia, pobieramy wartość bezpośrednio
        const value = context[key];
        console.log(`[ContextStore] Zmienna szablonu ${match} -> ${value !== undefined ? String(value) : match}`);
        return value !== undefined ? String(value) : match;
      } else {
        // Jeśli jest zagnieżdżenie
        const jsonPath = pathParts.join('.');
        const keyData = context[key];
        
        if (!keyData) return match;
        
        const value = getValueByPath(keyData, jsonPath);
        console.log(`[ContextStore] Zmienna szablonu ${match} -> ${value !== undefined ? String(value) : match}`);
        return value !== undefined ? String(value) : match;
      }
    });
  }
}));