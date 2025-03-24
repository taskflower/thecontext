// src/modules/filters/filterActions.ts
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { Filter, FilterActions, FilterOperator } from "./types";
import { AppState } from "../store";
import { Scenario } from "../scenarios/types";

export const createFilterSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  FilterActions
> = (set, get) => ({
  getScenarioFilters: () => {
    const state = get();
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    if (!workspace) return [];
    
    const scenario = workspace.children.find(s => s.id === state.selected.scenario);
    return scenario?.filters || [];
  },
  
  addScenarioFilter: (payload) => 
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      if (workspaceIndex === -1) return;
      
      const scenarioIndex = state.items[workspaceIndex].children.findIndex(
        s => s.id === state.selected.scenario
      );
      if (scenarioIndex === -1) return;
      
      // Initialize filters array if it doesn't exist
      if (!state.items[workspaceIndex].children[scenarioIndex].filters) {
        state.items[workspaceIndex].children[scenarioIndex].filters = [];
      }
      
      const newFilter: Filter = {
        id: `filter-${Date.now()}`,
        name: payload.name,
        contextKey: payload.contextKey,
        operator: payload.operator,
        value: payload.value || "",
        enabled: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      state.items[workspaceIndex].children[scenarioIndex].filters.push(newFilter);
      
      // Ensure updatedAt exists before using it
      if (!(state.items[workspaceIndex].children[scenarioIndex] as Scenario).updatedAt) {
        (state.items[workspaceIndex].children[scenarioIndex] as Scenario).updatedAt = Date.now();
      } else {
        (state.items[workspaceIndex].children[scenarioIndex] as Scenario).updatedAt = Date.now();
      }
      
      // Ensure workspace updatedAt exists
      if (!state.items[workspaceIndex].updatedAt) {
        state.items[workspaceIndex].updatedAt = Date.now();
      } else {
        state.items[workspaceIndex].updatedAt = Date.now();
      }
      
      state.stateVersion++;
    }),
  
  updateScenarioFilter: (id, payload) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      if (workspaceIndex === -1) return;
      
      const scenarioIndex = state.items[workspaceIndex].children.findIndex(
        s => s.id === state.selected.scenario
      );
      if (scenarioIndex === -1) return;
      
      const scenario = state.items[workspaceIndex].children[scenarioIndex] as Scenario;
      if (!scenario.filters) return;
      
      const filterIndex = scenario.filters.findIndex(f => f.id === id);
      if (filterIndex === -1) return;
      
      const filter = scenario.filters[filterIndex];
      
      if (payload.name !== undefined) {
        filter.name = payload.name;
      }
      
      if (payload.contextKey !== undefined) {
        filter.contextKey = payload.contextKey;
      }
      
      if (payload.operator !== undefined) {
        filter.operator = payload.operator;
        
        // Clear value if operator doesn't need one
        if (![FilterOperator.EQUALS, FilterOperator.NOT_EQUALS, FilterOperator.CONTAINS, 
              FilterOperator.NOT_CONTAINS, FilterOperator.GREATER_THAN, FilterOperator.LESS_THAN, 
              FilterOperator.JSON_PATH].includes(payload.operator)) {
          filter.value = "";
        }
      }
      
      if (payload.value !== undefined) {
        filter.value = payload.value;
      }
      
      filter.updatedAt = Date.now();
      
      // Ensure updatedAt exists
      if (!scenario.updatedAt) {
        scenario.updatedAt = Date.now();
      } else {
        scenario.updatedAt = Date.now();
      }
      
      // Ensure workspace updatedAt exists
      if (!state.items[workspaceIndex].updatedAt) {
        state.items[workspaceIndex].updatedAt = Date.now();
      } else {
        state.items[workspaceIndex].updatedAt = Date.now();
      }
      
      state.stateVersion++;
    }),
  
  deleteScenarioFilter: (id) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      if (workspaceIndex === -1) return;
      
      const scenarioIndex = state.items[workspaceIndex].children.findIndex(
        s => s.id === state.selected.scenario
      );
      if (scenarioIndex === -1) return;
      
      const scenario = state.items[workspaceIndex].children[scenarioIndex] as Scenario;
      if (!scenario.filters) return;
      
      const filterIndex = scenario.filters.findIndex(f => f.id === id);
      if (filterIndex === -1) return;
      
      scenario.filters.splice(filterIndex, 1);
      
      // Ensure updatedAt exists
      if (!scenario.updatedAt) {
        scenario.updatedAt = Date.now();
      } else {
        scenario.updatedAt = Date.now();
      }
      
      // Ensure workspace updatedAt exists
      if (!state.items[workspaceIndex].updatedAt) {
        state.items[workspaceIndex].updatedAt = Date.now();
      } else {
        state.items[workspaceIndex].updatedAt = Date.now();
      }
      
      state.stateVersion++;
    }),
  
  toggleScenarioFilter: (id) =>
    set((state: Draft<AppState>) => {
      const workspaceIndex = state.items.findIndex(w => w.id === state.selected.workspace);
      if (workspaceIndex === -1) return;
      
      const scenarioIndex = state.items[workspaceIndex].children.findIndex(
        s => s.id === state.selected.scenario
      );
      if (scenarioIndex === -1) return;
      
      const scenario = state.items[workspaceIndex].children[scenarioIndex] as Scenario;
      if (!scenario.filters) return;
      
      const filterIndex = scenario.filters.findIndex(f => f.id === id);
      if (filterIndex === -1) return;
      
      scenario.filters[filterIndex].enabled = !scenario.filters[filterIndex].enabled;
      
      // Ensure updatedAt exists
      if (!scenario.updatedAt) {
        scenario.updatedAt = Date.now();
      } else {
        scenario.updatedAt = Date.now();
      }
      
      // Ensure workspace updatedAt exists
      if (!state.items[workspaceIndex].updatedAt) {
        state.items[workspaceIndex].updatedAt = Date.now();
      } else {
        state.items[workspaceIndex].updatedAt = Date.now();
      }
      
      state.stateVersion++;
    }),
  
  checkScenarioFilterMatch: () => {
    const state = get();
    const filters = state.getScenarioFilters();
    
    // If no active filters, return true
    const activeFilters = filters.filter(f => f.enabled);
    if (activeFilters.length === 0) return true;
    
    // Get context items
    const contextItems = state.getContextItems();
    
    // Check each active filter
    return activeFilters.every(filter => {
      const contextItem = contextItems.find(item => item.title === filter.contextKey);
      
      // Context key doesn't exist
      if (!contextItem) {
        return filter.operator === FilterOperator.EMPTY;
      }
      
      const value = contextItem.content;
      
      switch (filter.operator) {
        case FilterOperator.EQUALS:
          return value === filter.value;
        case FilterOperator.NOT_EQUALS:
          return value !== filter.value;
        case FilterOperator.CONTAINS:
          return value.includes(filter.value || "");
        case FilterOperator.NOT_CONTAINS:
          return !value.includes(filter.value || "");
        case FilterOperator.EMPTY:
          return value === "" || value === null || value === undefined;
        case FilterOperator.NOT_EMPTY:
          return value !== "" && value !== null && value !== undefined;
        case FilterOperator.GREATER_THAN:
          return parseFloat(value) > parseFloat(filter.value || "0");
        case FilterOperator.LESS_THAN:
          return parseFloat(value) < parseFloat(filter.value || "0");
        case FilterOperator.JSON_PATH:
          try {
            const parsedJson = JSON.parse(value);
            // Basic JSON path implementation
            if (filter.value && filter.value.includes('.')) {
              const path = filter.value.split('.');
              let result = parsedJson;
              for (const key of path) {
                if (result && typeof result === 'object' && key in result) {
                  result = result[key];
                } else {
                  return false;
                }
              }
              return result !== undefined && result !== null;
            }
            return parsedJson[filter.value || ''] !== undefined;
          } catch {
            return false;
          }
        default:
          return true;
      }
    });
  }
});