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
          })
        );
        return id;
      },
      
      updateDashboard: (id, data) => {
        set(
          produce((state) => {
            const index = state.dashboards.findIndex(d => d.id === id);
            if (index !== -1) {
              state.dashboards[index] = {
                ...state.dashboards[index],
                ...data,
                updatedAt: new Date(),
              };
            }
          })
        );
      },
      
      deleteDashboard: (id) => {
        set(
          produce((state) => {
            state.dashboards = state.dashboards.filter(d => d.id !== id);
            if (state.selectedDashboardId === id) {
              state.selectedDashboardId = state.dashboards.length > 0 ? state.dashboards[0].id : null;
            }
          })
        );
      },
      
      // Widget CRUD
      addWidget: (dashboardId, widget) => {
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
            }
          })
        );
        return widgetId;
      },
      
      updateWidget: (dashboardId, widgetId, data) => {
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
              }
            }
          })
        );
      },
      
      deleteWidget: (dashboardId, widgetId) => {
        set(
          produce((state) => {
            const dashboardIndex = state.dashboards.findIndex(d => d.id === dashboardId);
            if (dashboardIndex !== -1) {
              state.dashboards[dashboardIndex].widgets = state.dashboards[dashboardIndex].widgets.filter(w => w.id !== widgetId);
              state.dashboards[dashboardIndex].updatedAt = new Date();
            }
          })
        );
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

export default useDashboardStore;