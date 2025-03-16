// src/modules/context/contextActions.ts
import { ElementType } from "../types";
import { Context, ContextItem, ContextValueType } from "./types";
import { SetFn } from "../typesActioss";

export const createContextActions = (set: SetFn) => ({
  selectContext: (contextId: string) =>
    set((state) => {
      state.selectedContext = contextId;
      state.stateVersion++;
    }),

  addContext: (payload: { name: string; workspaceId: string }) =>
    set((state) => {
      const timestamp = Date.now();
      const newContext: Context = {
        id: `context-${timestamp}`,
        type: ElementType.CONTEXT,
        name: payload.name,
        workspaceId: payload.workspaceId,
        items: [],
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      if (!state.contexts) {
        state.contexts = [];
      }
      
      state.contexts.push(newContext);
      state.selectedContext = newContext.id;
      state.stateVersion++;
    }),

  updateContext: (contextId: string, payload: { name?: string; items?: ContextItem[] }) =>
    set((state) => {
      if (!state.contexts) return;
      
      const context = state.contexts.find(c => c.id === contextId);
      if (!context) return;
      
      // Aktualizacja właściwości, jeśli zostały podane
      if (payload.name !== undefined) context.name = payload.name;
      if (payload.items !== undefined) context.items = payload.items;
      
      // Aktualizacja timestamp
      context.updatedAt = Date.now();
      
      state.stateVersion++;
    }),

  deleteContext: (contextId: string) =>
    set((state) => {
      if (!state.contexts) return;
      
      const index = state.contexts.findIndex(c => c.id === contextId);
      if (index === -1) return;
      
      state.contexts.splice(index, 1);
      
      // Wyczyść zaznaczenie, jeśli usunięty kontekst był zaznaczony
      if (state.selectedContext === contextId) {
        state.selectedContext = state.contexts.length > 0 ? state.contexts[0].id : undefined;
      }
      
      state.stateVersion++;
    }),
    
  // Dodawanie elementu kontekstu
  addContextItem: (contextId: string, item: ContextItem) =>
    set((state) => {
      if (!state.contexts) return;
      
      const context = state.contexts.find(c => c.id === contextId);
      if (!context) return;
      
      // Sprawdź, czy klucz już istnieje i zastąp go
      const existingIndex = context.items.findIndex(i => i.key === item.key);
      if (existingIndex !== -1) {
        context.items[existingIndex] = item;
      } else {
        context.items.push(item);
      }
      
      context.updatedAt = Date.now();
      state.stateVersion++;
    }),
    
  // Aktualizacja elementu kontekstu
  updateContextItem: (contextId: string, key: string, value: string, valueType: ContextValueType) =>
    set((state) => {
      if (!state.contexts) return;
      
      const context = state.contexts.find(c => c.id === contextId);
      if (!context) return;
      
      const item = context.items.find(i => i.key === key);
      if (item) {
        item.value = value;
        item.valueType = valueType;
        context.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  // Usuwanie elementu kontekstu
  deleteContextItem: (contextId: string, key: string) =>
    set((state) => {
      if (!state.contexts) return;
      
      const context = state.contexts.find(c => c.id === contextId);
      if (!context) return;
      
      const index = context.items.findIndex(i => i.key === key);
      if (index !== -1) {
        context.items.splice(index, 1);
        context.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
    
  // Pobieranie kontekstu dla workspace
  getContextByWorkspace: (workspaceId: string) => (state) => {
    if (!state.contexts) return undefined;
    return state.contexts.find(c => c.workspaceId === workspaceId);
  },
  
  // Pobieranie wartości kontekstu po kluczu
  getContextValueByKey: (workspaceId: string, key: string) => (state) => {
    if (!state.contexts) return undefined;
    
    const context = state.contexts.find(c => c.workspaceId === workspaceId);
    if (!context) return undefined;
    
    return context.items.find(i => i.key === key);
  },
  
  // Filtrowanie na podstawie kontekstu (do przyszłego użycia)
  filterByContext: (workspaceId: string, filterKey: string, filterValue: string) => (state) => {
    if (!state.contexts) return false;
    
    const context = state.contexts.find(c => c.workspaceId === workspaceId);
    if (!context) return false;
    
    const item = context.items.find(i => i.key === filterKey);
    if (!item) return false;
    
    if (item.valueType === 'json') {
      try {
        const jsonValue = JSON.parse(item.value);
        // Sprawdź, czy wartość jest zawarta w JSON (uproszczona implementacja)
        return JSON.stringify(jsonValue).includes(filterValue);
      } catch (e) {
        return false;
      }
    } else {
      // Dla wartości tekstowych sprawdź, czy zawiera szukaną wartość
      return item.value.includes(filterValue);
    }
  },
});