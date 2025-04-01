/**
 * Widget store implementation
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { v4 as uuidv4 } from 'uuid';
import { DashboardConfig, WidgetConfig, WidgetStore } from "./types";

/**
 * Generates a unique ID
 */
const generateId = (): string => uuidv4();

/**
 * Gets current timestamp as ISO string
 */
const timestamp = (): string => new Date().toISOString();

/**
 * Create widget store with persistence
 */
export const useWidgetStore = create<WidgetStore>()(
  persist(
    (set, get) => ({
      // State
      dashboards: [],
      selectedDashboardId: null,
      isLoading: false,
      error: null,
      
      // Dashboard selection
      selectDashboard: (id) => {
        set({ selectedDashboardId: id });
      },
      
      // Dashboard CRUD
      createDashboard: (data) => {
        try {
          const id = generateId();
          const now = timestamp();
          
          const newDashboard: DashboardConfig = {
            id,
            name: data.name,
            description: data.description || `Created on ${new Date().toLocaleDateString()}`,
            workspaceId: data.workspaceId,
            widgets: [],
            createdAt: now,
            updatedAt: now,
          };
          
          set(produce(state => {
            state.dashboards.push(newDashboard);
            
            // Auto-select the new dashboard if none selected
            if (state.selectedDashboardId === null) {
              state.selectedDashboardId = id;
            }
            
            state.error = null;
          }));
          
          return id;
        } catch (err) {
          const errorMsg = `Failed to create dashboard: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
          return "";
        }
      },
      
      updateDashboard: (id, data) => {
        try {
          set(produce(state => {
            const dashboard = state.dashboards.find((d: DashboardConfig) => d.id === id);
            if (!dashboard) {
              state.error = `Dashboard with id ${id} not found`;
              return;
            }
            
            if (data.name !== undefined) dashboard.name = data.name;
            if (data.description !== undefined) dashboard.description = data.description;
            if (data.workspaceId !== undefined) dashboard.workspaceId = data.workspaceId;
            dashboard.updatedAt = timestamp();
            
            state.error = null;
          }));
        } catch (err) {
          const errorMsg = `Failed to update dashboard: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
        }
      },
      
      deleteDashboard: (id) => {
        try {
          set(produce(state => {
            const index = state.dashboards.findIndex((d: DashboardConfig) => d.id === id);
            if (index === -1) {
              state.error = `Dashboard with id ${id} not found`;
              return;
            }
            
            // Remove the dashboard
            state.dashboards.splice(index, 1);
            
            // Update selection if needed
            if (state.selectedDashboardId === id) {
              state.selectedDashboardId = state.dashboards.length > 0 ? state.dashboards[0].id : null;
            }
            
            state.error = null;
          }));
        } catch (err) {
          const errorMsg = `Failed to delete dashboard: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
        }
      },
      
      // Widget CRUD
      addWidget: (dashboardId, data) => {
        try {
          const widgetId = generateId();
          const now = timestamp();
          
          set(produce(state => {
            const dashboard = state.dashboards.find((d: DashboardConfig) => d.id === dashboardId);
            if (!dashboard) {
              state.error = `Dashboard with id ${dashboardId} not found`;
              return;
            }
            
            const newWidget: WidgetConfig = {
              id: widgetId,
              title: data.title,
              widgetType: data.widgetType,
              height: data.height || 300, // Default height
              config: data.config || {},
              createdAt: now,
              updatedAt: now,
            };
            
            dashboard.widgets.push(newWidget);
            dashboard.updatedAt = now;
            
            state.error = null;
          }));
          
          return widgetId;
        } catch (err) {
          const errorMsg = `Failed to add widget: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
          return "";
        }
      },
      
      updateWidget: (dashboardId, widgetId, data) => {
        try {
          set(produce(state => {
            const dashboard = state.dashboards.find((d: DashboardConfig) => d.id === dashboardId);
            if (!dashboard) {
              state.error = `Dashboard with id ${dashboardId} not found`;
              return;
            }
            
            const widget = dashboard.widgets.find((w: WidgetConfig) => w.id === widgetId);
            if (!widget) {
              state.error = `Widget with id ${widgetId} not found`;
              return;
            }
            
            // Update widget properties
            if (data.title !== undefined) widget.title = data.title;
            if (data.height !== undefined) widget.height = data.height;
            
            // Update config with merge
            if (data.config) {
              widget.config = {
                ...widget.config || {},
                ...data.config
              };
            }
            
            widget.updatedAt = timestamp();
            dashboard.updatedAt = timestamp();
            
            state.error = null;
          }));
        } catch (err) {
          const errorMsg = `Failed to update widget: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
        }
      },
      
      deleteWidget: (dashboardId, widgetId) => {
        try {
          set(produce(state => {
            const dashboard = state.dashboards.find((d: DashboardConfig) => d.id === dashboardId);
            if (!dashboard) {
              state.error = `Dashboard with id ${dashboardId} not found`;
              return;
            }
            
            const widgetIndex = dashboard.widgets.findIndex((w: WidgetConfig) => w.id === widgetId);
            if (widgetIndex === -1) {
              state.error = `Widget with id ${widgetId} not found`;
              return;
            }
            
            // Remove the widget
            dashboard.widgets.splice(widgetIndex, 1);
            dashboard.updatedAt = timestamp();
            
            state.error = null;
          }));
        } catch (err) {
          const errorMsg = `Failed to delete widget: ${err instanceof Error ? err.message : String(err)}`;
          console.error(errorMsg);
          set({ error: errorMsg });
        }
      },
      
      // Getters
      getDashboard: (id) => {
        return get().dashboards.find(d => d.id === id);
      },
      
      getDashboardByWorkspace: (workspaceId) => {
        return get().dashboards.find(d => d.workspaceId === workspaceId);
      },
      
      getWidget: (dashboardId, widgetId) => {
        const dashboard = get().getDashboard(dashboardId);
        if (!dashboard) return undefined;
        return dashboard.widgets.find(w => w.id === widgetId);
      },
      
      // Error handling
      setError: (message) => {
        set({ error: message });
      },
      
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'widgets-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dashboards: state.dashboards,
        selectedDashboardId: state.selectedDashboardId,
      }),
      merge: (persistedState: unknown, currentState) => {
        // Basic state merge
        const mergedState = {
          ...currentState,
          ...persistedState as object,
          isLoading: false,
          error: null,
        };
        
        // Data cleanup/validation
        if (Array.isArray(mergedState.dashboards)) {
          // Validate each dashboard
          mergedState.dashboards = mergedState.dashboards.filter((d: DashboardConfig) => 
            d && 
            typeof d === 'object' && 
            typeof d.id === 'string' && 
            typeof d.name === 'string' &&
            Array.isArray(d.widgets)
          );
          
          // Validate widgets in each dashboard
          mergedState.dashboards.forEach((d: DashboardConfig) => {
            if (d.widgets) {
              d.widgets = d.widgets.filter(widget => 
                widget && 
                typeof widget === 'object' && 
                typeof widget.id === 'string' && 
                typeof widget.widgetType === 'string'
              );
            }
          });
        } else {
          // Initialize empty dashboards array if missing
          mergedState.dashboards = [];
        }
        
        // Validate selectedDashboardId
        if (mergedState.selectedDashboardId && 
            (!mergedState.dashboards.some((d: DashboardConfig) => d.id === mergedState.selectedDashboardId))) {
          mergedState.selectedDashboardId = null;
        }
        
        return mergedState;
      }
    }
  )
);

// Selector hooks for components
export const useSelectedDashboardId = () => useWidgetStore(state => state.selectedDashboardId);
export const useSelectedDashboard = () => {
  const selectedId = useSelectedDashboardId();
  return useWidgetStore(state => selectedId ? state.getDashboard(selectedId) : undefined);
};
export const useWidgetError = () => useWidgetStore(state => state.error);
export const useDashboards = () => useWidgetStore(state => state.dashboards);
export const useWorkspaceDashboard = (workspaceId: string | null) => {
  return useWidgetStore(state => 
    workspaceId ? state.getDashboardByWorkspace(workspaceId) : undefined
  );
};

export default useWidgetStore;