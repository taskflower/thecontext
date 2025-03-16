// src/modules/context/hooks/useContext.ts

import { useAppStore } from "@/modules/store";

export function useWorkspaceContext() {
  const selected = useAppStore(state => state.selected);
  const getContextValue = useAppStore(state => state.getContextValue);
  const getContextItems = useAppStore(state => state.getContextItems);
  const addContextItem = useAppStore(state => state.addContextItem);
  const updateContextItem = useAppStore(state => state.updateContextItem);
  const deleteContextItem = useAppStore(state => state.deleteContextItem);
  
  const workspaceId = selected.workspace;
  
  return {
    // Pobieranie pojedynczej wartości
    getValue: (key: string) => getContextValue(workspaceId, key)(useAppStore.getState()),
    
    // Pobieranie wartości z parsowaniem JSON
    getJsonValue: (key: string) => {
      const value = getContextValue(workspaceId, key)(useAppStore.getState());
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(`Error parsing JSON for key ${key}:`, e);
        return null;
      }
    },
    
    // Pobieranie wszystkich elementów
    getAllItems: () => getContextItems(workspaceId)(useAppStore.getState()),
    
    // Dodawanie nowego elementu
    addItem: (key: string, value: string, valueType: 'text' | 'json' = 'text') => 
      addContextItem(workspaceId, { key, value, valueType }),
    
    // Aktualizacja elementu
    updateItem: (key: string, value: string, valueType?: 'text' | 'json') => {
      const items = getContextItems(workspaceId)(useAppStore.getState());
      const item = items.find(i => i.key === key);
      
      if (item) {
        updateContextItem(
          workspaceId, 
          key, 
          value, 
          valueType || item.valueType
        );
        return true;
      }
      return false;
    },
    
    // Usuwanie elementu
    deleteItem: (key: string) => deleteContextItem(workspaceId, key),
    
    // Funkcja do zastępowania tokenów kontekstu w tekstach
    processTemplate: (template: string): string => {
      if (!template) return '';
      
      const items = getContextItems(workspaceId)(useAppStore.getState());
      
      let result = template;
      items.forEach(item => {
        const tokenPattern = new RegExp(`{{${item.key}}}`, 'g');
        
        if (item.valueType === 'text') {
          result = result.replace(tokenPattern, item.value);
        } else if (item.valueType === 'json') {
          try {
            const parsedValue = JSON.parse(item.value);
            result = result.replace(
              tokenPattern, 
              typeof parsedValue === 'object' 
                ? JSON.stringify(parsedValue) 
                : String(parsedValue)
            );
          } catch (e) {
            console.error(`Error parsing JSON for key ${item.key}:`, e);
          }
        }
      });
      
      return result;
    }
  };
}