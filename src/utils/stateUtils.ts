// src/utils/stateUtils.ts

/**
 * Funkcje pomocnicze do zarządzania stanem
 */
export const stateUtils = {
    /**
     * Sprawdza, czy obiekt został zmodyfikowany
     */
    hasObjectChanged: <T extends Record<string, any>>(
      oldObj: T | null | undefined,
      newObj: T | null | undefined
    ): boolean => {
      // Porównanie referencji
      if (oldObj === newObj) return false;
      
      // Jeśli jeden z nich jest null/undefined a drugi nie
      if (!oldObj || !newObj) return true;
      
      // Porównanie zawartości 
      return JSON.stringify(oldObj) !== JSON.stringify(newObj);
    },
    
    /**
     * Uniwersalny reducer do zarządzania stanem ładowania/błędu
     */
    createAsyncReducer: <T extends Record<string, any>>(
      initialState: T & { isLoading: boolean; error: string | null }
    ) => {
      return {
        startLoading: (state: T & { isLoading: boolean; error: string | null }) => ({
          ...state,
          isLoading: true,
          error: null
        }),
        
        setError: (
          state: T & { isLoading: boolean; error: string | null },
          error: unknown
        ) => ({
          ...state,
          isLoading: false,
          error: error instanceof Error ? error.message : String(error)
        }),
        
        setData: <D>(
          state: T & { isLoading: boolean; error: string | null },
          data: D
        ) => ({
          ...state,
          isLoading: false,
          error: null,
          ...data
        })
      };
    },
    
    /**
     * Unikalna aktualizacja listy elementów
     */
    updateItemInList: <T extends { id: string }>(
      list: T[],
      item: T
    ): T[] => {
      const exists = list.some(i => i.id === item.id);
      
      if (exists) {
        return list.map(i => i.id === item.id ? item : i);
      } else {
        return [...list, item];
      }
    }
  };