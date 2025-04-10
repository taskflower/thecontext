// src/lib/contextStore.ts
import { create } from 'zustand';

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
  // Stan kontekstu
  context: Record<string, any>;
  
  // Akcje
  setContext: (context: Record<string, any>) => void;
  updateContext: (key: string, value: any) => void;
  updateContextPath: (key: string, jsonPath: string, value: any) => void;
  
  // Gettery
  getContextValue: (key: string) => any;
  getContextPathValue: (key: string, jsonPath: string) => any;
}

export const useContextStore = create<ContextState>((set, get) => ({
  context: {},
  
  // Ustawia pełny kontekst (np. przy inicjalizacji workspace'a)
  setContext: (context) => set({ context }),
  
  // Aktualizuje wartość całego klucza
  updateContext: (key, value) => set(state => ({
    context: { ...state.context, [key]: value }
  })),
  
  // Aktualizuje wartość w konkretnej ścieżce, np. "userProfile.firstName"
  updateContextPath: (key, jsonPath, value) => set(state => {
    // Klonujemy obiekt dla danego klucza
    const keyData = { ...(state.context[key] || {}) };
    
    // Ustawiamy wartość w danej ścieżce
    const updatedKeyData = setValueByPath(keyData, jsonPath, value);
    
    // Zwracamy zaktualizowany kontekst
    return {
      context: { ...state.context, [key]: updatedKeyData }
    };
  }),
  
  // Pobiera wartość dla danego klucza
  getContextValue: (key) => get().context[key],
  
  // Pobiera wartość z danej ścieżki
  getContextPathValue: (key, jsonPath) => {
    const keyData = get().context[key];
    if (!keyData) return undefined;
    return getValueByPath(keyData, jsonPath);
  }
}));