import React, { useState, useCallback, useMemo } from "react";
import { useDashboardStore, useSelectedDashboardId } from "../dashboardStore";
import DashboardWidget from "./DashboardWidget";
import { Button } from "../../../components/ui/button";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { AlertCircle } from "lucide-react";
import { lazy, Suspense } from "react";
import { usePanelStore } from '../../../modules/PanelStore';
import { useAppStore } from '../../../modules/store';

// Lazy load dialog for better performance
const AddWidgetDialog = lazy(() => import("./AddWidgetDialog"));

interface DashboardProps {
  dashboardId?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ dashboardId }) => {
  const [isAddingWidget, setIsAddingWidget] = useState(false);

  // Uprościmy ten komponent i użyjemy bezpośrednio funkcji ze store
  const selectedDashboardId = useSelectedDashboardId();
  const dashboardError = useDashboardStore(state => state.error);
  const dashboards = useDashboardStore(state => state.dashboards);
  
  // Pobierz informacje o aktualnym workspace
  const currentWorkspaceId = useAppStore(state => state.selected.workspace);

  // Memoize the current dashboard ID and dashboard data
  const currentDashboardId = useMemo(() => 
    dashboardId || selectedDashboardId,
    [dashboardId, selectedDashboardId]
  );
  
  // Bezpośrednie pobieranie dashboardu z listy dashboardów
  const currentDashboard = useMemo(() => 
    currentDashboardId ? dashboards.find(d => d.id === currentDashboardId) : undefined,
    [currentDashboardId, dashboards]
  );

  // Memoize the list of widgets to prevent unnecessary re-renders
  const widgets = useMemo(() => 
    currentDashboard?.widgets || [],
    [currentDashboard]
  );

  const handleAddWidget = useCallback(() => {
    setIsAddingWidget(true);
  }, []);

  const handleCloseAddWidget = useCallback(() => {
    setIsAddingWidget(false);
  }, []);

  if (!currentDashboard) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center p-4">
          <h2 className="text-xl font-semibold mb-2">No Dashboard Available</h2>
          <p className="text-muted-foreground">
            {currentWorkspaceId ? 
              "This workspace doesn't have a dashboard yet. Create one in the Dashboard panel." : 
              "Please select a workspace or create a new dashboard."
            }
          </p>
          <Button 
            onClick={() => usePanelStore.getState().setBottomPanelTab('dashboard')} 
            variant="outline" 
            className="mt-4"
          >
            Go to Dashboard Panel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {dashboardError && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{dashboardError}</AlertDescription>
        </Alert>
      )}
      
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
        {widgets.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                No widgets added to this dashboard yet.
              </p>
              <Button onClick={handleAddWidget}>Add Your First Widget</Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {widgets.map((widget) => (
              <DashboardWidget
                key={widget.id}
                widget={widget}
                dashboardId={currentDashboard.id}
              />
            ))}
          </div>
        )}
      </div>

      {isAddingWidget && currentDashboardId && (
        <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
          <AddWidgetDialog
            dashboardId={currentDashboardId}
            onClose={handleCloseAddWidget}
          />
        </Suspense>
      )}
    </div>
  );
};

export default React.memo(Dashboard);
