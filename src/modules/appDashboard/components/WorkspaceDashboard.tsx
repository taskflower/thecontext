import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '../dashboardStore';
import { useAppStore } from '@/modules/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import DashboardWidget from './DashboardWidget';

interface WorkspaceDashboardProps {
  workspaceId?: string;
}

const WorkspaceDashboard: React.FC<WorkspaceDashboardProps> = ({ workspaceId }) => {
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [newDashboardName, setNewDashboardName] = useState('');
  const { 
    dashboards, 
    createDashboard, 
    getDashboardByWorkspaceId,
    addWidget
  } = useDashboardStore();
  
  // Get the current workspace
  const currentWorkspace = useAppStore(state => {
    if (workspaceId) {
      return state.items.find(w => w.id === workspaceId);
    }
    return state.getCurrentWorkspace();
  });
  
  const currentWorkspaceId = currentWorkspace?.id;
  
  // Find dashboard for this workspace
  const workspaceDashboard = currentWorkspaceId 
    ? getDashboardByWorkspaceId(currentWorkspaceId)
    : null;
  
  // Create a default dashboard for the workspace if none exists
  useEffect(() => {
    if (currentWorkspaceId && !workspaceDashboard && dashboards.length > 0) {
      // If no workspace dashboard, but other dashboards exist, create one for this workspace
      const dashboardName = currentWorkspace?.title 
        ? `${currentWorkspace.title} Dashboard` 
        : 'Workspace Dashboard';
      
      createDashboard({
        name: dashboardName,
        description: 'Dashboard for this workspace',
        workspaceId: currentWorkspaceId,
        widgets: []
      });
    } else if (currentWorkspaceId && !workspaceDashboard && dashboards.length === 0) {
      // No dashboards at all, prompt the user to create one
      setIsCreatingDashboard(true);
    }
  }, [currentWorkspaceId, workspaceDashboard, dashboards.length]);
  
  // Handle creating a new dashboard for the workspace
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim() || !currentWorkspaceId) return;
    
    const dashboardId = createDashboard({
      name: newDashboardName.trim(),
      description: `Dashboard for workspace: ${currentWorkspace?.title || 'Unknown'}`,
      workspaceId: currentWorkspaceId,
      widgets: []
    });
    
    // Add some default widgets based on workspace data
    if (currentWorkspace?.children?.length) {
      addWidget(dashboardId, {
        title: 'Scenarios',
        pluginKey: 'DashboardPlugin',
        size: { width: 1, height: 1 },
        position: { x: 0, y: 0 },
        pluginData: {
          title: 'Scenarios',
          description: 'Total scenarios in this workspace',
          value: currentWorkspace.children.length.toString(),
          type: 'number',
          color: 'primary'
        },
        workspaceId: currentWorkspaceId
      });
    }
    
    if (currentWorkspace?.contextItems?.length) {
      addWidget(dashboardId, {
        title: 'Context Items',
        pluginKey: 'DashboardPlugin',
        size: { width: 1, height: 1 },
        position: { x: 1, y: 0 },
        pluginData: {
          title: 'Context Items',
          description: 'Total context items in this workspace',
          value: currentWorkspace.contextItems.length.toString(),
          type: 'number',
          color: 'success'
        },
        workspaceId: currentWorkspaceId
      });
    }
    
    setNewDashboardName('');
    setIsCreatingDashboard(false);
  };
  
  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }
  
  if (!workspaceDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <LayoutGrid className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">No Dashboard Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md">
          This workspace doesn't have a dashboard yet. Create one to visualize your workspace data.
        </p>
        <Button 
          onClick={() => setIsCreatingDashboard(true)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Create Workspace Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold">{workspaceDashboard.name}</h1>
          {workspaceDashboard.description && (
            <p className="text-sm text-muted-foreground">{workspaceDashboard.description}</p>
          )}
        </div>
        <Button 
          onClick={() => {
            // Handle adding widgets to the dashboard
            // This could open a dialog to select widget types
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Widget
        </Button>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        {workspaceDashboard.widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <p className="text-muted-foreground mb-4">No widgets added to this dashboard yet</p>
            <Button 
              variant="outline"
              onClick={() => {
                // Handle adding the first widget
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Widget
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspaceDashboard.widgets.map((widget) => (
              <DashboardWidget 
                key={widget.id}
                widget={widget}
                dashboardId={workspaceDashboard.id}
              />
            ))}
          </div>
        )}
      </div>
      
      <Dialog open={isCreatingDashboard} onOpenChange={setIsCreatingDashboard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Dashboard for {currentWorkspace.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input 
                id="dashboard-name" 
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="Workspace Dashboard"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingDashboard(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDashboard} disabled={!newDashboardName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceDashboard;