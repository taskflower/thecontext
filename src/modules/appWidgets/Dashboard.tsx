/**
 * Dashboard component to display widgets
 */
import { useMemo } from "react";
import { useWidgetStore } from "./widgetStore";
import { WidgetWrapper } from "./WidgetWrapper";
import { Button } from "@/components/ui/button";
import { useAppStore } from "../store";

interface DashboardProps {
  dashboardId?: string | null;
}

/**
 * Dashboard component
 */
export function Dashboard({ dashboardId }: DashboardProps) {
  // Get selected and current dashboard
  const selectedDashboardId = useWidgetStore(
    (state) => state.selectedDashboardId
  );
  const currentWorkspaceId = useAppStore((state) => state.selected.workspace);

  // Get all dashboards
  const dashboards = useWidgetStore((state) => state.dashboards);

  // Determine which dashboard to show
  const activeDashboardId = useMemo(() => {
    // Priority 1: Explicit dashboard ID
    if (dashboardId) {
      return dashboardId;
    }

    // Priority 2: Selected dashboard
    if (selectedDashboardId) {
      const dashboard = dashboards.find((d) => d.id === selectedDashboardId);

      // If selected dashboard exists and is compatible with current workspace
      if (
        dashboard &&
        (!dashboard.workspaceId || dashboard.workspaceId === currentWorkspaceId)
      ) {
        return selectedDashboardId;
      }
    }

    // Priority 3: Workspace-specific dashboard
    if (currentWorkspaceId) {
      const workspaceDashboard = dashboards.find(
        (d) => d.workspaceId === currentWorkspaceId
      );
      if (workspaceDashboard) {
        return workspaceDashboard.id;
      }
    }

    // Priority 4: First global dashboard
    const firstGlobal = dashboards.find((d) => !d.workspaceId);
    if (firstGlobal) {
      return firstGlobal.id;
    }

    // Priority 5: First dashboard of any kind
    if (dashboards.length > 0) {
      return dashboards[0].id;
    }

    // No dashboard available
    return null;
  }, [dashboardId, selectedDashboardId, dashboards, currentWorkspaceId]);

  // Get active dashboard
  const activeDashboard = useMemo(() => {
    if (!activeDashboardId) return null;
    return dashboards.find((d) => d.id === activeDashboardId) || null;
  }, [activeDashboardId, dashboards]);

  // If no dashboard, show empty state
  if (!activeDashboard) {
    return (
      <div className="flex flex-col items-center justify-center p-8 h-full">
        <p className="text-muted-foreground mb-4 text-center">
          No dashboard available. Create a new dashboard to get started.
        </p>
        <Button
          onClick={() => {
            // Create new dashboard
            const newId = useWidgetStore.getState().createDashboard({
              name: "New Dashboard",
              description: "Created automatically",
              workspaceId: currentWorkspaceId,
            });

            // Select new dashboard
            useWidgetStore.getState().selectDashboard(newId);
          }}
        >
          Create Dashboard
        </Button>
      </div>
    );
  }

  // Render dashboard with widgets
  return (
    <div className="p-4 h-full overflow-auto">
      {activeDashboard.widgets.length === 0 ? (
        <></>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-6">
          {activeDashboard.widgets.map((widget) => (
            <WidgetWrapper
              key={widget.id}
              widget={widget}
              dashboardId={activeDashboard.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
