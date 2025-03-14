/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/scenarios/FilterComponents.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  FilterX,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { create } from "zustand";

// Filter condition types
export type ConditionOperator =
  | "exists"
  | "notExists"
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains";

export interface FilterCondition {
  id: string;
  key: string;
  operator: ConditionOperator;
  value?: string;
}

// Create a dedicated filter store
interface FilterStore {
  activeFilters: FilterCondition[];
  filteringEnabled: boolean;
  setActiveFilters: (filters: FilterCondition[]) => void;
  setFilteringEnabled: (enabled: boolean) => void;
  addFilter: (filter: FilterCondition) => void;
  removeFilter: (filterId: string) => void;
  clearAllFilters: () => void;
  toggleFiltering: () => void;
}

export const useFilterStore = create<FilterStore>((set) => ({
  activeFilters: [],
  filteringEnabled: false,
  setActiveFilters: (filters) => set({ activeFilters: filters }),
  setFilteringEnabled: (enabled) => set({ filteringEnabled: enabled }),
  addFilter: (filter) => 
    set((state) => {
      // Check if we already have this filter
      const exists = state.activeFilters.some(
        (f) =>
          f.key === filter.key &&
          f.operator === filter.operator &&
          f.value === filter.value
      );
      
      if (!exists) {
        return { 
          activeFilters: [...state.activeFilters, filter],
          filteringEnabled: true
        };
      }
      return state;
    }),
  removeFilter: (filterId) => 
    set((state) => ({
      activeFilters: state.activeFilters.filter((f) => f.id !== filterId)
    })),
  clearAllFilters: () => 
    set({ activeFilters: [], filteringEnabled: false }),
  toggleFiltering: () => 
    set((state) => ({ filteringEnabled: !state.filteringEnabled }))
}));

// Get operator display text
export const getOperatorDisplay = (operator: ConditionOperator): string => {
  switch (operator) {
    case "exists":
      return "exists";
    case "notExists":
      return "does not exist";
    case "equals":
      return "equals";
    case "notEquals":
      return "not equals";
    case "contains":
      return "contains";
    case "notContains":
      return "does not contain";
    default:
      return operator;
  }
};

// Component for the filter button and dropdown
export const FilterDropdown: React.FC = () => {
  const { 
    activeFilters, 
    removeFilter, 
    clearAllFilters 
  } = useFilterStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          <Badge
            variant="secondary"
            className="ml-2 bg-blue-100 text-blue-800"
          >
            {activeFilters.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-80 p-3" align="start">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Active Filters</h4>

            {activeFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="h-7 text-red-500 hover:text-red-700"
              >
                <FilterX className="h-3 w-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {activeFilters.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-2">
              No active filters. Edit a scenario to define filters.
            </div>
          ) : (
            <div className="space-y-2">
              {activeFilters.map((filter) => (
                <div
                  key={filter.id}
                  className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs"
                >
                  <div>
                    <span className="font-medium">{filter.key}</span>{" "}
                    <span className="text-slate-500">
                      {getOperatorDisplay(filter.operator)}
                    </span>{" "}
                    {filter.value && (
                      <span className="italic">"{filter.value}"</span>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-red-400"
                    onClick={() => removeFilter(filter.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Component for the filter toggle button
export const FilterToggle: React.FC = () => {
  const { 
    activeFilters, 
    filteringEnabled, 
    toggleFiltering 
  } = useFilterStore();

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleFiltering}
      className={
        filteringEnabled ? "text-green-600" : "text-slate-500"
      }
    >
      {filteringEnabled ? "Filtering On" : "Filtering Off"}
    </Button>
  );
};

// Utility function to check if a scenario matches filters
export const scenarioMatchesFilters = (scenario: any): boolean => {
  const { activeFilters, filteringEnabled } = useFilterStore.getState();
  
  if (!filteringEnabled || activeFilters.length === 0) {
    return true; // No filtering applied
  }

  // Check each filter condition
  return activeFilters.every((condition) => {
    const { key, operator, value } = condition;

    // Get the value from scenario context
    const scenarioContext = scenario.context || {};
    const hasKey = key in scenarioContext;
    const contextValue = scenarioContext[key];

    switch (operator) {
      case "exists":
        return hasKey;
      case "notExists":
        return !hasKey;
      case "equals":
        return hasKey && contextValue === value;
      case "notEquals":
        return hasKey && contextValue !== value;
      case "contains":
        return (
          hasKey &&
          typeof contextValue === "string" &&
          contextValue.includes(value || "")
        );
      case "notContains":
        return (
          hasKey &&
          (typeof contextValue !== "string" ||
            !contextValue.includes(value || ""))
        );
      default:
        return true;
    }
  });
};

// Add a filter from a scenario
export const addFilterFromScenario = (scenario: any) => {
  const { addFilter } = useFilterStore.getState();
  
  if (!scenario || !scenario.context || !scenario.context.filterConditions) {
    return;
  }

  // Add the first filter condition from this scenario if it exists
  const scenarioFilters = scenario.context.filterConditions as FilterCondition[];
  if (scenarioFilters.length > 0) {
    const newFilter = { ...scenarioFilters[0], id: Date.now().toString() };
    addFilter(newFilter);
  }
};