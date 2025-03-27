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
  value?: string; // Optional for EMPTY/NOT_EMPTY
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface FilterActions {
  // Get filters for the current scenario
  getScenarioFilters: () => Filter[];
  
  // Add a new filter
  addScenarioFilter: (payload: { name: string; contextKey: string; operator: FilterOperator; value?: string }) => void;
  
  // Update an existing filter
  updateScenarioFilter: (id: string, payload: { name?: string; contextKey?: string; operator?: FilterOperator; value?: string }) => void;
  
  // Delete a filter
  deleteScenarioFilter: (id: string) => void;
  
  // Toggle filter enabled state
  toggleScenarioFilter: (id: string) => void;
  
  // Check if context matches filter conditions
  checkScenarioFilterMatch: () => boolean;
}

// Add to your main types file or export from here
export interface FilterStatusProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}