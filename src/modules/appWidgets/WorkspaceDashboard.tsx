/**
 * Workspace dashboard component
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWidgetStore } from './widgetStore';
import { useAppStore } from '../store';
import Dashboard from './Dashboard';
import AddWidgetDialog from './AddWidgetDialog';
import { Plus } from 'lucide-react';

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
  const currentWorkspaceId = workspaceId || useAppStore(state => state.selected.workspace);
  
  // Get dashboard store data
  const dashboards = useWidgetStore(state => state.dashboards);
  const selectedDashboardId = useWidgetStore(state => state.selectedDashboardId);
  
  // Find dashboard for this workspace
  const workspaceDashboard = React.useMemo(() => {
    // Only look for a dashboard specifically for this workspace
    if (!currentWorkspaceId) return null;
    
    const dashboard = dashboards.find(d => d.workspaceId === currentWorkspaceId);
    return dashboard || null;
  }, [currentWorkspaceId, dashboards]);
  
  // Create a dashboard for this workspace if needed
  const createWorkspaceDashboard = () => {
    if (!currentWorkspaceId) return;
    
    const name = `Dashboard for ${useAppStore.getState().getWorkspaceTitle(currentWorkspaceId)}`;
    
    const dashboardId = useWidgetStore.getState().createDashboard({
      name,
      description: 'Workspace dashboard',
      workspaceId: currentWorkspaceId,
    });
    
    useWidgetStore.getState().selectDashboard(dashboardId);
  };
  
  // If no suitable dashboard and we have a workspace, offer to create one
  if (!workspaceDashboard && currentWorkspaceId) {
    return (
      <div className="p-4 h-full">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            No dashboard available for this workspace. 
            Create a workspace dashboard to visualize data for this workspace.
          </p>
          <Button onClick={createWorkspaceDashboard}>
            Create Workspace Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  // If no dashboard and no workspace, show message
  if (!workspaceDashboard) {
    return (
      <div className="p-4 h-full">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground mb-4 text-center max-w-md">
            Please select a workspace first to view or create a dashboard.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
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
      
      {/* Dashboard */}
      <div className="flex-1 overflow-auto">
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