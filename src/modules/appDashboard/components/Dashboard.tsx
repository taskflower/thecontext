import React, { useState, useCallback } from "react";
import { useDashboardStore } from "../dashboardStore";
import DashboardWidget from "./DashboardWidget";
import { Button } from "../../../components/ui/button";
import AddWidgetDialog from "./AddWidgetDialog";

interface DashboardProps {
  dashboardId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardId }) => {
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  const {
    selectedDashboardId,

    getDashboard,
  } = useDashboardStore();

  const currentDashboardId = dashboardId || selectedDashboardId;
  const currentDashboard = currentDashboardId
    ? getDashboard(currentDashboardId)
    : undefined;

  const handleAddWidget = useCallback(() => {
    setIsAddingWidget(true);
  }, []);

  const handleCloseAddWidget = useCallback(() => {
    setIsAddingWidget(false);
  }, []);

  if (!currentDashboard) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{currentDashboard.name}</h1>
          {currentDashboard.description && (
            <p className="text-sm text-muted-foreground">
              {currentDashboard.description}
            </p>
          )}
          {currentDashboard.workspaceId && (
            <div className="flex items-center mt-1">
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                Workspace Dashboard
              </span>
            </div>
          )}
        </div>
        <Button onClick={handleAddWidget}>Add Widget</Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentDashboard.widgets.map((widget) => (
            <DashboardWidget
              key={widget.id}
              widget={widget}
              dashboardId={currentDashboard.id}
            />
          ))}
        </div>
      </div>

      {isAddingWidget && currentDashboardId && (
        <AddWidgetDialog
          dashboardId={currentDashboardId}
          onClose={handleCloseAddWidget}
        />
      )}
    </div>
  );
};

export default Dashboard;
