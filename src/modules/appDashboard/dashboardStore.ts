/**
 * Dashboard store implementation
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { produce } from "immer";
import { DashboardStore, DashboardWidgetConfig } from "./types";
import { generateId } from "../../utils/utils";

/**
 * Create dashboard store with persistence
 */
export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // State
      dashboards: [],
      selectedDashboardId: null,
      isLoading: false,
      error: null,
      
      // Getters
      getDashboard: (id: string) => {
        return get().dashboards.find(dashboard => dashboard.id === id);
      },
      
      getDashboardByWorkspaceId: (workspaceId: string) => {
        return get().dashboards.find(dashboard => dashboard.workspaceId === workspaceId);
      },
      
      getWidget: (dashboardId: string, widgetId: string) => {
        const dashboard = get().getDashboard(dashboardId);
        if (!dashboard) return undefined;
        return dashboard.widgets.find(widget => widget.id === widgetId);
      },
      
      // Dashboard CRUD
      createDashboard: (dashboard) => {
        try {
          const id = generateId();
          set(
            produce((state) => {
              state.dashboards.push({
                ...dashboard,
                id,
                createdAt: new Date(),
                updatedAt: new Date(),
                widgets: dashboard.widgets || [],
              });
              if (!state.selectedDashboardId) {
                state.selectedDashboardId = id;
              }
              // Clear any previous errors
              state.error = null;
            })
          );
          return id;
        } catch (err) {
          set({ error: `Failed to create dashboard: ${err instanceof Error ? err.message : String(err)}` });
          return "";
        }
      },
      
      updateDashboard: (id, data) => {
        try {
          set(
            produce((state) => {
              const index = state.dashboards.findIndex(d => d.id === id);
              if (index !== -1) {
                state.dashboards[index] = {
                  ...state.dashboards[index],
                  ...data,
                  updatedAt: new Date(),
                };
                state.error = null;
              } else {
                state.error = `Dashboard with id ${id} not found`;
              }
            })
          );
        } catch (err) {
          set({ error: `Failed to update dashboard: ${err instanceof Error ? err.message : String(err)}` });
        }
      },
      
      deleteDashboard: (id) => {
        try {
          set(
            produce((state) => {
              const dashboardExists = state.dashboards.some(d => d.id === id);
              if (!dashboardExists) {
                state.error = `Dashboard with id ${id} not found`;
                return;
              }
              
              state.dashboards = state.dashboards.filter(d => d.id !== id);
              if (state.selectedDashboardId === id) {
                state.selectedDashboardId = state.dashboards.length > 0 ? state.dashboards[0].id : null;
              }
              state.error = null;
            })
          );
        } catch (err) {
          set({ error: `Failed to delete dashboard: ${err instanceof Error ? err.message : String(err)}` });
        }
      },
      
      // Widget CRUD
      addWidget: (dashboardId, widget) => {
        try {
          const widgetId = generateId();
          set(
            produce((state) => {
              const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboardId);
              if (dashboardIndex !== -1) {
                const newWidget: DashboardWidgetConfig = {
                  ...widget,
                  id: widgetId,
                };
                state.dashboards[dashboardIndex].widgets.push(newWidget);
                state.dashboards[dashboardIndex].updatedAt = new Date();
                state.error = null;
              } else {
                state.error = `Dashboard with id ${dashboardId} not found`;
              }
            })
          );
          return widgetId;
        } catch (err) {
          set({ error: `Failed to add widget: ${err instanceof Error ? err.message : String(err)}` });
          return "";
        }
      },
      
      updateWidget: (dashboardId, widgetId, data) => {
        try {
          set(
            produce((state) => {
              const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboardId);
              if (dashboardIndex !== -1) {
                const widgetIndex = state.dashboards[dashboardIndex].widgets.findIndex(w => w.id === widgetId);
                if (widgetIndex !== -1) {
                  state.dashboards[dashboardIndex].widgets[widgetIndex] = {
                    ...state.dashboards[dashboardIndex].widgets[widgetIndex],
                    ...data,
                  };
                  state.dashboards[dashboardIndex].updatedAt = new Date();
                  state.error = null;
                } else {
                  state.error = `Widget with id ${widgetId} not found in dashboard ${dashboardId}`;
                }
              } else {
                state.error = `Dashboard with id ${dashboardId} not found`;
              }
            })
          );
        } catch (err) {
          set({ error: `Failed to update widget: ${err instanceof Error ? err.message : String(err)}` });
        }
      },
      
      deleteWidget: (dashboardId, widgetId) => {
        try {
          set(
            produce((state) => {
              const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboardId);
              if (dashboardIndex !== -1) {
                const widgetExists = state.dashboards[dashboardIndex].widgets.some(w => w.id === widgetId);
                if (!widgetExists) {
                  state.error = `Widget with id ${widgetId} not found in dashboard ${dashboardId}`;
                  return;
                }
                
                state.dashboards[dashboardIndex].widgets = state.dashboards[dashboardIndex].widgets.filter(w => w.id !== widgetId);
                state.dashboards[dashboardIndex].updatedAt = new Date();
                state.error = null;
              } else {
                state.error = `Dashboard with id ${dashboardId} not found`;
              }
            })
          );
        } catch (err) {
          set({ error: `Failed to delete widget: ${err instanceof Error ? err.message : String(err)}` });
        }
      },
      
      // Selection
      setSelectedDashboard: (id) => {
        set({ selectedDashboardId: id });
      },
    }),
    {
      name: "dashboard-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        dashboards: state.dashboards,
        selectedDashboardId: state.selectedDashboardId,
      }),
    }
  )
);

// Create selector hooks for better performance
export const useSelectedDashboardId = () => useDashboardStore(state => state.selectedDashboardId);
export const useDashboardError = () => useDashboardStore(state => state.error);
export const useDashboardLoading = () => useDashboardStore(state => state.isLoading);
export const useDashboards = () => useDashboardStore(state => state.dashboards);

export default useDashboardStore;