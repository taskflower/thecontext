// src/modules/filters/types.ts
export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  EMPTY = "empty",
  NOT_EMPTY = "notEmpty",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  JSON_PATH = "jsonPath"
}

export interface Filter {
  id: string;
  name: string;
  contextKey: string;
  operator: FilterOperator;
  value?: string; // Opcjonalne dla EMPTY/NOT_EMPTY
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FilterActions {
  // Pobierz filtry dla bieżącego scenariusza lub określonego przez ID
  getScenarioFilters: (scenarioId?: string) => Filter[];
  
  // Dodaj nowy filtr
  addScenarioFilter: (
    payload: { 
      name: string; 
      contextKey: string; 
      operator: FilterOperator; 
      value?: string 
    }, 
    scenarioId?: string
  ) => void;
  
  // Aktualizuj istniejący filtr
  updateScenarioFilter: (
    id: string, 
    payload: { 
      name?: string; 
      contextKey?: string; 
      operator?: FilterOperator; 
      value?: string 
    }, 
    scenarioId?: string
  ) => void;
  
  // Usuń filtr
  deleteScenarioFilter: (
    id: string, 
    scenarioId?: string
  ) => void;
  
  // Przełącz stan włączenia filtra
  toggleScenarioFilter: (
    id: string, 
    scenarioId?: string
  ) => void;
  
  // Sprawdź, czy kontekst spełnia warunki filtrów
  checkScenarioFilterMatch: (
    scenarioId?: string
  ) => boolean;
}

// Dodaj do głównego pliku typów lub eksportuj stąd
export interface FilterStatusProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}