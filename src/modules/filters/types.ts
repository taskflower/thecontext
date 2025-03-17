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