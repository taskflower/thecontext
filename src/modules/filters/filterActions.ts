import { SetFn, GetFn } from "../typesActioss";
import { ContextItem, AppState } from "../types";
import { Filter, FilterOperator } from "./types";

export const createFilterActions = (set: SetFn, get: GetFn) => ({
  // Add filter to scenario
  addScenarioFilter: (scenarioId: string, filter: Omit<Filter, "id" | "createdAt" | "updatedAt">) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace || !workspace.children) return;
      
      const scenario = workspace.children.find(s => s.id === scenarioId);
      if (!scenario) return;
      
      if (!scenario.filters) {
        scenario.filters = [];
      }
      
      const newFilter: Filter = {
        ...filter,
        id: `filter-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      
      scenario.filters.push(newFilter);
      scenario.updatedAt = Date.now();
      state.stateVersion++;
    }),
    
  // Update existing filter
  updateScenarioFilter: (scenarioId: string, filterId: string, updates: Partial<Filter>) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace || !workspace.children) return;
      
      const scenario = workspace.children.find(s => s.id === scenarioId);
      if (!scenario || !scenario.filters) return;
      
      const filter = scenario.filters.find(f => f.id === filterId);
      if (!filter) return;
      
      Object.assign(filter, {
        ...updates,
        updatedAt: Date.now()
      });
      
      scenario.updatedAt = Date.now();
      state.stateVersion++;
    }),
  
  // Delete filter
  deleteScenarioFilter: (scenarioId: string, filterId: string) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace || !workspace.children) return;
      
      const scenario = workspace.children.find(s => s.id === scenarioId);
      if (!scenario || !scenario.filters) return;
      
      const index = scenario.filters.findIndex(f => f.id === filterId);
      if (index !== -1) {
        scenario.filters.splice(index, 1);
        scenario.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
  
  // Toggle filter enabled state
  toggleScenarioFilter: (scenarioId: string, filterId: string) =>
    set((state) => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace || !workspace.children) return;
      
      const scenario = workspace.children.find(s => s.id === scenarioId);
      if (!scenario || !scenario.filters) return;
      
      const filter = scenario.filters.find(f => f.id === filterId);
      if (filter) {
        filter.enabled = !filter.enabled;
        scenario.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),
  
  // Get all filters for a scenario
  getScenarioFilters: (scenarioId: string) => (state: AppState) => {
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    if (!workspace || !workspace.children) return [];
    
    const scenario = workspace.children.find(s => s.id === scenarioId);
    return scenario?.filters || [];
  },
  
  // Check if context items match filter conditions for a scenario
  checkScenarioFilterMatch: (scenarioId: string, contextItems: ContextItem[]) => {
    const state = get();
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    if (!workspace || !workspace.children) return true;
    
    const scenario = workspace.children.find(s => s.id === scenarioId);
    if (!scenario || !scenario.filters) return true;
    
    // Only use enabled filters
    const activeFilters = scenario.filters.filter(f => f.enabled);
    
    if (activeFilters.length === 0) return true;
    
    return activeFilters.every(filter => {
      const contextItem = contextItems.find(item => item.key === filter.contextKey);
      
      // Handle case when context item doesn't exist
      if (!contextItem) {
        return filter.operator === FilterOperator.EMPTY;
      }
      
      const { value, valueType } = contextItem;
      
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
          if (valueType === "json") {
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
          }
          return false;
        default:
          return true;
      }
    });
  },
  
  // Get scenarios with filter match status
  getScenariosWithFilterStatus: () => {
    const state = get();
    const workspace = state.items.find(w => w.id === state.selected.workspace);
    if (!workspace || !workspace.children) return [];
    
    const contextItems = workspace.contextItems || [];
    
    // Add filter match status to each scenario
    return workspace.children.map(scenario => {
      const scenarioId = scenario.id;
      const matchesFilter = state.checkScenarioFilterMatch(scenarioId, contextItems);
      return {
        ...scenario,
        matchesFilter
      };
    });
  }
});