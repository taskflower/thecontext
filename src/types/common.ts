/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/common.ts

// Add these filter-related types
export type ConditionOperator = "exists" | "notExists" | "equals" | "notEquals" | "contains" | "notContains";

export interface FilterCondition {
  id: string;
  key: string;
  operator: ConditionOperator;
  value?: string;
}

export interface Node {
  id: string;
  type: string;
  position: {
    x: number;
    y: number;
  };
  data: Record<string, any>;
  scenarioId: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

export interface Scenario {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  isTemplate: boolean;
  templateId?: string;
  edgeIds: string[];
  context?: {
    filterConditions?: FilterCondition[];
    [key: string]: any; // Other context values
  };
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  scenarioIds: string[];
  nodes: any[]; // Flow nodes if workspace has a visual representation
  context: {
    activeFilters?: FilterCondition[];
    filteringEnabled?: boolean;
    [key: string]: any; // Other context values
  };
}