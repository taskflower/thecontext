import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWidgetStore } from "./widgetStore";
import { useAppStore } from "../store";
import Dashboard from "./Dashboard";
import AddWidgetDialog from "./AddWidgetDialog";
import { Plus } from "lucide-react";

interface WorkspaceDashboardProps {
  workspaceId?: string | null;
}

/**
 * Workspace dashboard component
 * Shows a dashboard for the current workspace with ability to add widgets
 */
export function WorkspaceDashboard({ workspaceId }: WorkspaceDashboardProps) {
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  // Get current workspace ID from props or app store
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const currentWorkspaceId = workspaceId || selectedWorkspaceId;

  // Get dashboard store data
  const dashboards = useWidgetStore((state) => state.dashboards);
  useWidgetStore((state) => state.selectedDashboardId);

  // Find dashboard for this workspace
  const workspaceDashboard = React.useMemo(() => {
    // Only look for a dashboard specifically for this workspace
    if (!currentWorkspaceId) return null;

    const dashboard = dashboards.find(
      (d) => d.workspaceId === currentWorkspaceId
    );
    return dashboard || null;
  }, [currentWorkspaceId, dashboards]);

  if (!workspaceDashboard) {
    return <></>;
  }

  // Check current page to determine rendering style
  const currentView = window.location.pathname.includes("studio")
    ? "studio"
    : "workspace";
  const isStudioView = currentView === "studio";

  return (
    <div className="h-full flex flex-col">
      {/* Header - Only show in studio view */}
      {isStudioView && (
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-medium">{workspaceDashboard.name}</h2>
            {workspaceDashboard.description && (
              <p className="text-sm text-muted-foreground">
                {workspaceDashboard.description}
              </p>
            )}
          </div>

          <Button
            id="add-widget-button"
            onClick={() => setIsAddingWidget(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        </div>
      )}

      {/* Dashboard */}
      <div className={`flex-1 overflow-auto`}>
        <Dashboard dashboardId={workspaceDashboard.id} />
      </div>

      {/* Add widget dialog */}
      {isAddingWidget && (
        <AddWidgetDialog
          dashboardId={workspaceDashboard.id}
          isOpen={isAddingWidget}
          onClose={() => setIsAddingWidget(false)}
        />
      )}
    </div>
  );
}

export default WorkspaceDashboard;
