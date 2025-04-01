import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dashboard, 
  useWidgetStore, 
  useDashboards, 
  useSelectedDashboard,
  AddWidgetDialog
} from '@/modules/appWidgets';
import { useAppStore } from '@/modules/store';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Plus, Trash2, Edit, Link2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Dashboard panel component for managing dashboards
 */
const DashboardPanel: React.FC = () => {
  // UI State
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [isAddingWidget, setIsAddingWidget] = useState(false);
  const [deletingDashboardId, setDeletingDashboardId] = useState<string | null>(null);
  const [editingDashboardId, setEditingDashboardId] = useState<string | null>(null);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [dashboardView, setDashboardView] = useState<'view' | 'manage'>('view');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Get workspaces and selected workspace from app store
  const workspaces = useAppStore(state => state.items);
  const currentWorkspaceId = useAppStore(state => state.selected.workspace);
  
  // Get dashboard store selectors with safe extraction patterns
  const dashboards = useDashboards();
  const selectedDashboard = useSelectedDashboard();
  const dashboardStoreError = useWidgetStore(state => state.error);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreatingDashboard) {
      setNewDashboardName('');
      setDashboardDescription('');
    }
  }, [isCreatingDashboard]);
  
  // Clear store error on unmount
  useEffect(() => {
    return () => {
      useWidgetStore.getState().clearError();
    };
  }, []);
  
  // Set local error message from store error
  useEffect(() => {
    if (dashboardStoreError) {
      setErrorMessage(dashboardStoreError);
      // Auto-clear error after 5 seconds
      const timer = setTimeout(() => {
        setErrorMessage(null);
        useWidgetStore.getState().clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [dashboardStoreError]);
  
  /**
   * Handle dashboard creation
   */
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) {
      setErrorMessage('Dashboard name is required');
      return;
    }
    
    if (!currentWorkspaceId) {
      setErrorMessage('Please select a workspace first');
      return;
    }
    
    try {
      const dashboardId = useWidgetStore.getState().createDashboard({
        name: newDashboardName.trim(),
        description: dashboardDescription || `Dashboard created on ${new Date().toLocaleDateString()}`,
        workspaceId: currentWorkspaceId
      });
      
      if (dashboardId) {
        useWidgetStore.getState().selectDashboard(dashboardId);
        setDashboardView('view');
      }
      setIsCreatingDashboard(false);
    } catch (err) {
      setErrorMessage(`Failed to create dashboard: ${err instanceof Error ? err.message : String(err)}`);
    }
  };
  
  /**
   * Handle dashboard deletion confirmation
   */
  const handleDeleteDashboard = (dashboardId: string) => {
    setDeletingDashboardId(dashboardId);
  };
  
  /**
   * Execute dashboard deletion
   */
  const confirmDeleteDashboard = () => {
    if (deletingDashboardId) {
      try {
        useWidgetStore.getState().deleteDashboard(deletingDashboardId);
        setDeletingDashboardId(null);
      } catch (err) {
        setErrorMessage(`Failed to delete dashboard: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };
  
  /**
   * Initialize dashboard edit operation
   */
  const handleEditDashboard = (dashboardId: string) => {
    const dashboard = useWidgetStore.getState().getDashboard(dashboardId);
    
    if (dashboard) {
      setNewDashboardName(dashboard.name);
      setDashboardDescription(dashboard.description || '');
      setEditingDashboardId(dashboardId);
    } else {
      setErrorMessage(`Dashboard with ID ${dashboardId} not found`);
    }
  };
  
  /**
   * Save edited dashboard
   */
  const saveEditedDashboard = () => {
    if (editingDashboardId) {
      try {
        useWidgetStore.getState().updateDashboard(editingDashboardId, {
          name: newDashboardName.trim(),
          description: dashboardDescription
          // Workspace ID is never changed - a dashboard belongs to its workspace forever
        });
        
        // Reset form state
        setEditingDashboardId(null);
        setNewDashboardName('');
        setDashboardDescription('');
      } catch (err) {
        setErrorMessage(`Failed to update dashboard: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };
  
  /**
   * Filter dashboards based on current workspace
   */
  const filteredDashboards = useMemo(() => {
    if (currentWorkspaceId) {
      // Show only dashboards associated with current workspace
      return dashboards.filter(dashboard => dashboard.workspaceId === currentWorkspaceId);
    }
    // If no workspace selected, show no dashboards
    return [];
  }, [dashboards, currentWorkspaceId]);
  
  /**
   * All dashboards belong to the current workspace
   */
  const workspaceDashboards = filteredDashboards;
  
  /**
   * Get workspace name by ID
   */
  const getWorkspaceName = (id: string) => {
    const workspace = workspaces.find(ws => ws.id === id);
    return workspace ? workspace.title : 'Unknown Workspace';
  };
  
  /**
   * Set the selected dashboard and switch view
   */
  const handleViewDashboard = (dashboardId: string) => {
    useWidgetStore.getState().selectDashboard(dashboardId);
    
    // For workspace-specific dashboards, select that workspace
    const dashboard = useWidgetStore.getState().getDashboard(dashboardId);
    if (dashboard?.workspaceId) {
      useAppStore.getState().selectWorkspace(dashboard.workspaceId);
    }
    
    // Switch to view mode
    setDashboardView('view');
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Error Message */}
      {errorMessage && (
        <Alert variant="destructive" className="m-4 mt-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {/* Dashboard Panel Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Tabs 
          value={dashboardView} 
          onValueChange={(v) => setDashboardView(v as 'view' | 'manage')}
          className="w-[260px]"
        >
          <TabsList>
            <TabsTrigger value="view">View Dashboard</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {dashboardView === 'manage' && (
          <Button onClick={() => setIsCreatingDashboard(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Dashboard
          </Button>
        )}
        
        {dashboardView === 'view' && selectedDashboard && (
          <Button onClick={() => setIsAddingWidget(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Widget
          </Button>
        )}
      </div>
      
      {/* Dashboard Content */}
      <div className="flex-1 overflow-auto">
        {dashboardView === 'view' ? (
          selectedDashboard ? (
            <Dashboard dashboardId={selectedDashboard.id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-md">
                <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">No dashboard selected</p>
                <Button
                  variant="outline"
                  onClick={() => setDashboardView('manage')}
                >
                  Select or Create Dashboard
                </Button>
              </div>
            </div>
          )
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Available Dashboards</h3>
            
            {!currentWorkspaceId ? (
              <div className="text-center p-8 border rounded-md bg-muted/10">
                <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Please select a workspace first</p>
              </div>
            ) : workspaceDashboards.length === 0 ? (
              <div className="text-center p-8 border rounded-md bg-muted/10">
                <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dashboards for this workspace</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2" 
                  onClick={() => setIsCreatingDashboard(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Workspace Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Workspace dashboards section */}
                <div>
                  <h4 className="text-md font-medium mb-3 flex items-center">
                    <span>Workspace: {getWorkspaceName(currentWorkspaceId)}</span>
                    <Badge variant="outline" className="ml-2">
                      {workspaceDashboards.length}
                    </Badge>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {workspaceDashboards.map(dashboard => (
                      <Card key={dashboard.id} className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{dashboard.name}</h4>
                          <Badge 
                            variant="outline" 
                            className="bg-primary/10 text-primary border-primary/20"
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Workspace
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">{dashboard.description}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">
                            {dashboard.widgets.length} widgets
                          </span>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewDashboard(dashboard.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditDashboard(dashboard.id)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteDashboard(dashboard.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create Dashboard Dialog */}
      <Dialog open={isCreatingDashboard} onOpenChange={setIsCreatingDashboard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="dashboard-name">Dashboard Name</Label>
              <Input 
                id="dashboard-name" 
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="My Dashboard"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Input 
                id="dashboard-description" 
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                placeholder="Dashboard description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="current-workspace">Workspace</Label>
              <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                {currentWorkspaceId ? getWorkspaceName(currentWorkspaceId) : 'No workspace selected'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Dashboard will be created for the current workspace
              </p>
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
      
      {/* Edit Dashboard Dialog */}
      <Dialog open={!!editingDashboardId} onOpenChange={(open) => !open && setEditingDashboardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dashboard-name">Dashboard Name</Label>
              <Input 
                id="edit-dashboard-name" 
                value={newDashboardName}
                onChange={(e) => setNewDashboardName(e.target.value)}
                placeholder="Dashboard Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-dashboard-description">Description</Label>
              <Input 
                id="edit-dashboard-description" 
                value={dashboardDescription}
                onChange={(e) => setDashboardDescription(e.target.value)}
                placeholder="Dashboard description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dashboard-workspace">Workspace</Label>
              {editingDashboardId && (
                <div className="flex items-center h-10 px-3 rounded-md border border-input bg-background">
                  {getWorkspaceName(
                    useWidgetStore.getState().getDashboard(editingDashboardId)?.workspaceId || ''
                  )}
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Dashboard is permanently attached to its workspace
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingDashboardId(null)}>
              Cancel
            </Button>
            <Button onClick={saveEditedDashboard} disabled={!newDashboardName.trim()}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dashboard Confirmation Dialog */}
      <Dialog open={!!deletingDashboardId} onOpenChange={(open) => !open && setDeletingDashboardId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete this dashboard? This action cannot be undone.</p>
            {deletingDashboardId && (
              <div className="mt-2 p-2 bg-muted/20 rounded border">
                <p className="font-medium">
                  {dashboards.find(d => d.id === deletingDashboardId)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dashboards.find(d => d.id === deletingDashboardId)?.description}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingDashboardId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteDashboard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Widget Dialog */}
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

export default DashboardPanel;