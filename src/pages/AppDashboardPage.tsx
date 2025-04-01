import React, { useState } from 'react';
import { usePlugins } from '../modules/plugins/pluginContext';
import { WorkspaceHeader } from '../components/frontApp';
import { Dashboard, DashboardPanel, AddWidgetDialog } from '../modules/appWidgets';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useWidgetStore, useDashboards, useSelectedDashboard } from '../modules/appWidgets';

const AppDashboardPage: React.FC = () => {
  const { isLoaded } = usePlugins();
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  
  // Get dashboards and selected dashboard
  const dashboards = useDashboards();
  const selectedDashboard = useSelectedDashboard();
  
  // Get current workspace ID
  const currentWorkspaceId = useAppStore(state => state.selected.workspace);

  // Handle create dashboard if none exist
  const handleCreateDashboard = () => {
    if (!currentWorkspaceId) {
      alert("Please select a workspace first");
      return;
    }

    const workspaceName = useAppStore.getState().getWorkspaceTitle(currentWorkspaceId);
    
    const dashboardId = useWidgetStore.getState().createDashboard({
      name: `Dashboard for ${workspaceName}`,
      description: 'Workspace dashboard',
      workspaceId: currentWorkspaceId
    });
    
    useWidgetStore.getState().selectDashboard(dashboardId);
  };
  
  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Loading dashboard plugins...</p>
      </div>
    );
  }
  
  // Filter dashboards for the current workspace
  const workspaceDashboards = dashboards.filter(d => d.workspaceId === currentWorkspaceId);
  
  // Show create dashboard prompt if no dashboards exist for this workspace
  if (workspaceDashboards.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <WorkspaceHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-semibold mb-4">No Dashboard for this Workspace</h2>
            <p className="text-muted-foreground mb-6">
              Create a dashboard for this workspace to visualize data and metrics.
            </p>
            {currentWorkspaceId ? (
              <Button onClick={handleCreateDashboard}>Create Workspace Dashboard</Button>
            ) : (
              <p className="text-muted-foreground">Please select a workspace first</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <WorkspaceHeader />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Dashboard selector sidebar */}
        <div className="w-64 border-r p-4 overflow-y-auto">
          <DashboardPanel />
        </div>
        
        {/* Main dashboard area */}
        <div className="flex-1 flex flex-col">
          {selectedDashboard ? (
            <>
              {/* Dashboard header */}
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-medium">{selectedDashboard.name}</h2>
                  {selectedDashboard.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedDashboard.description}
                    </p>
                  )}
                </div>
                
                <Button 
                  onClick={() => setIsAddingWidget(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Widget
                </Button>
              </div>
              
              {/* Dashboard content */}
              <div className="flex-1 overflow-auto">
                <Dashboard dashboardId={selectedDashboard.id} />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Select a dashboard to view
            </div>
          )}
        </div>
      </div>
      
      {/* Add widget dialog */}
      {isAddingWidget && selectedDashboard && (
        <AddWidgetDialog
          dashboardId={selectedDashboard.id}
          isOpen={isAddingWidget}
          onClose={() => setIsAddingWidget(false)}
        />
      )}
    </div>
  );
};

export default AppDashboardPage;