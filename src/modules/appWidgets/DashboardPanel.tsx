/**
 * Dashboard panel component for managing dashboards
 */
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWidgetStore } from './widgetStore';
import { useAppStore } from '@/modules/store';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Plus, Trash2, Edit, Link2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Dashboard from './Dashboard';

/**
 * Dashboard panel component
 */
export function DashboardPanel() {
  // UI state
  const [view, setView] = useState<'view' | 'manage'>('view');
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [isEditingDashboard, setIsEditingDashboard] = useState(false);
  const [isDeletingDashboard, setIsDeletingDashboard] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | 'none'>('none');
  
  // Get workspaces
  const workspaces = useAppStore(state => state.items);
  const currentWorkspaceId = useAppStore(state => state.selected.workspace);
  
  // Get dashboards
  const dashboards = useWidgetStore(state => state.dashboards);
  const selectedDashboardId = useWidgetStore(state => state.selectedDashboardId);
  const error = useWidgetStore(state => state.error);
  
  // Reset form when dialogs close
  useEffect(() => {
    if (!isCreatingDashboard && !isEditingDashboard) {
      setName('');
      setDescription('');
      setWorkspaceId('none');
    }
  }, [isCreatingDashboard, isEditingDashboard]);
  
  // Load dashboard data when editing
  useEffect(() => {
    if (isEditingDashboard && editId) {
      const dashboard = dashboards.find(d => d.id === editId);
      if (dashboard) {
        setName(dashboard.name);
        setDescription(dashboard.description || '');
        setWorkspaceId(dashboard.workspaceId || 'none');
      }
    }
  }, [isEditingDashboard, editId, dashboards]);
  
  // Filter dashboards based on current workspace
  const filteredDashboards = React.useMemo(() => {
    if (!currentWorkspaceId) {
      return dashboards;
    }
    return dashboards.filter(d => !d.workspaceId || d.workspaceId === currentWorkspaceId);
  }, [dashboards, currentWorkspaceId]);
  
  // Group dashboards by workspace
  const groupedDashboards = React.useMemo(() => {
    const groups: Record<string, typeof dashboards> = {};
    
    for (const dashboard of filteredDashboards) {
      const key = dashboard.workspaceId || 'global';
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(dashboard);
    }
    
    return groups;
  }, [filteredDashboards]);
  
  // Handlers
  const handleCreateDashboard = () => {
    if (!name) return;
    
    useWidgetStore.getState().createDashboard({
      name,
      description,
      workspaceId: workspaceId === 'none' ? "" : workspaceId,
    });
    
    setIsCreatingDashboard(false);
  };
  
  const handleUpdateDashboard = () => {
    if (!editId || !name) return;
    
    useWidgetStore.getState().updateDashboard(editId, {
      name,
      description,
     workspaceId: workspaceId === 'none' ? undefined : workspaceId,
    });
    
    setIsEditingDashboard(false);
    setEditId(null);
  };
  
  const handleDeleteDashboard = () => {
    if (!deleteId) return;
    
    useWidgetStore.getState().deleteDashboard(deleteId);
    
    setIsDeletingDashboard(false);
    setDeleteId(null);
  };
  
  const handleViewDashboard = (id: string) => {
    useWidgetStore.getState().selectDashboard(id);
    
    // If workspace-specific dashboard, switch to that workspace
    const dashboard = dashboards.find(d => d.id === id);
    if (dashboard?.workspaceId) {
      useAppStore.getState().selectWorkspace(dashboard.workspaceId);
    }
    
    setView('view');
  };
  
  const getWorkspaceName = (id: string) => {
    return workspaces.find(w => w.id === id)?.title || 'Unknown Workspace';
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Error alert */}
      {error && (
        <Alert variant="destructive" className="m-4 mt-0">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as 'view' | 'manage')} className="w-[260px]">
          <TabsList>
            <TabsTrigger value="view">View Dashboard</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {view === 'manage' && (
          <Button onClick={() => setIsCreatingDashboard(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Dashboard
          </Button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto">
        {view === 'view' ? (
          <Dashboard dashboardId={selectedDashboardId} />
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Available Dashboards</h3>
            
            {filteredDashboards.length === 0 ? (
              <div className="text-center p-8 border rounded-md bg-muted/10">
                <LayoutDashboard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No dashboards created yet</p>
                <Button 
                  variant="outline" 
                  className="mt-4 gap-2" 
                  onClick={() => setIsCreatingDashboard(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create Your First Dashboard
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Global dashboards */}
                {groupedDashboards['global'] && (
                  <div>
                    <h4 className="text-md font-medium mb-3 flex items-center">
                      <span>Global Dashboards</span>
                      <Badge variant="outline" className="ml-2">
                        {groupedDashboards['global'].length}
                      </Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {groupedDashboards['global'].map(dashboard => (
                        <Card key={dashboard.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{dashboard.name}</h4>
                            <Badge variant="outline">Global</Badge>
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
                                onClick={() => {
                                  setEditId(dashboard.id);
                                  setIsEditingDashboard(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => {
                                  setDeleteId(dashboard.id);
                                  setIsDeletingDashboard(true);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Workspace dashboards */}
                {Object.entries(groupedDashboards)
                  .filter(([key]) => key !== 'global')
                  .map(([wsId, dashboardList]) => (
                    <div key={wsId}>
                      <h4 className="text-md font-medium mb-3 flex items-center">
                        <span>Workspace: {getWorkspaceName(wsId)}</span>
                        <Badge variant="outline" className="ml-2">
                          {dashboardList.length}
                        </Badge>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {dashboardList.map(dashboard => (
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
                                  onClick={() => {
                                    setEditId(dashboard.id);
                                    setIsEditingDashboard(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => {
                                    setDeleteId(dashboard.id);
                                    setIsDeletingDashboard(true);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create dashboard dialog */}
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Dashboard"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dashboard-description">Description</Label>
              <Input 
                id="dashboard-description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dashboard description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dashboard-workspace">Associate with Workspace</Label>
              <Select 
                value={workspaceId} 
                onValueChange={setWorkspaceId}
              >
                <SelectTrigger id="dashboard-workspace">
                  <SelectValue placeholder="Select a workspace (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Global Dashboard)</SelectItem>
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Associating a dashboard with a workspace will make it appear in that workspace's page
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingDashboard(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateDashboard} disabled={!name}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit dashboard dialog */}
      <Dialog open={isEditingDashboard} onOpenChange={setIsEditingDashboard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Dashboard Name</Label>
              <Input 
                id="edit-name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dashboard Name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input 
                id="edit-description" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Dashboard description (optional)"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-workspace">Associate with Workspace</Label>
              <Select 
                value={workspaceId} 
                onValueChange={setWorkspaceId}
              >
                <SelectTrigger id="edit-workspace">
                  <SelectValue placeholder="Select a workspace (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Global Dashboard)</SelectItem>
                  {workspaces.map(workspace => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Associating a dashboard with a workspace will make it appear in that workspace's page
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingDashboard(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateDashboard} disabled={!name}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete dashboard dialog */}
      <Dialog open={isDeletingDashboard} onOpenChange={setIsDeletingDashboard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Dashboard</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p>Are you sure you want to delete this dashboard? This action cannot be undone.</p>
            {deleteId && (
              <div className="mt-2 p-2 bg-muted/20 rounded border">
                <p className="font-medium">
                  {dashboards.find(d => d.id === deleteId)?.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {dashboards.find(d => d.id === deleteId)?.description}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletingDashboard(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDashboard}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DashboardPanel;