// src/modules/filters/types.ts
import { ContextItem } from "../context/types";

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
  value?: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

// Struktura danych dla akcji filtrów
export interface FilterActionParams {
  name: string;
  contextKey: string;
  operator: FilterOperator;
  value?: string;
}

// Interfejs dla akcji filtrów w Zustand
export interface FilterActions {
  // Pobieranie filtrów
  getScenarioFilters: (scenarioId?: string) => Filter[];
  
  // Zarządzanie filtrami
  addScenarioFilter: (
    payload: FilterActionParams, 
    scenarioId?: string
  ) => void;
  
  updateScenarioFilter: (
    id: string, 
    payload: Partial<FilterActionParams>, 
    scenarioId?: string
  ) => void;
  
  deleteScenarioFilter: (
    id: string, 
    scenarioId?: string
  ) => void;
  
  toggleScenarioFilter: (
    id: string, 
    scenarioId?: string
  ) => void;
  
  // Ewaluacja filtrów
  checkScenarioFilterMatch: (
    scenarioId?: string
  ) => boolean;
  
  // Funkcja pomocnicza dla ewaluacji pojedynczego filtra
  evaluateFilter: (filter: Filter, contextItems: ContextItem[]) => boolean;
}

// Interfejs dla komponentu FilterStatus
export interface FilterStatusProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  scenarioId?: string;
}

// Interfejs dla komponentu FilterStatusBanner
export interface FilterStatusBannerProps {
  filtersMatch: boolean;
  activeFiltersCount: number;
}

// Interfejs dla komponentu FilterItem
export interface FilterItemProps {
  filter: Filter;
  onEdit: (filter: Filter) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}

// Interfejs dla komponentu FiltersList
export interface FiltersListProps {
  scenarioId?: string;
}