import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkspaceDashboardPage } from '@/modules/appDashboard';
import { useDashboardStore } from '@/modules/appDashboard/dashboardStore';
import { useAppStore } from '@/modules/store';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Plus, Trash2, Edit, Link2 } from 'lucide-react';

const DashboardPanel: React.FC = () => {
  const [isCreatingDashboard, setIsCreatingDashboard] = useState(false);
  const [deletingDashboardId, setDeletingDashboardId] = useState<string | null>(null);
  const [newDashboardName, setNewDashboardName] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | 'none'>('none');
  const [dashboardDescription, setDashboardDescription] = useState('');
  const [dashboardView, setDashboardView] = useState<'view' | 'manage'>('view');
  
  // Get workspaces and selected workspace from app store
  const workspaces = useAppStore(state => state.items);
  const currentWorkspaceId = useAppStore(state => state.selected.workspace);
  
  // Get dashboards from dashboard store
  const { 
    createDashboard, 
    dashboards, 
    updateDashboard,
    deleteDashboard,
    setSelectedDashboard
  } = useDashboardStore();
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!isCreatingDashboard) {
      setNewDashboardName('');
      setSelectedWorkspaceId('none');
      setDashboardDescription('');
    }
  }, [isCreatingDashboard]);
  
  const handleCreateDashboard = () => {
    if (!newDashboardName.trim()) return;
    
    const dashboardData = {
      name: newDashboardName.trim(),
      description: dashboardDescription || `Dashboard created on ${new Date().toLocaleDateString()}`,
      workspaceId: selectedWorkspaceId === 'none' ? undefined : selectedWorkspaceId,
      widgets: []
    };
    
    createDashboard(dashboardData);
    setIsCreatingDashboard(false);
  };
  
  const handleDeleteDashboard = (dashboardId: string) => {
    setDeletingDashboardId(dashboardId);
  };
  
  const confirmDeleteDashboard = () => {
    if (deletingDashboardId) {
      deleteDashboard(deletingDashboardId);
      setDeletingDashboardId(null);
    }
  };
  
  // Group dashboards by workspace for better organization
  const groupedDashboards = dashboards.reduce((groups, dashboard) => {
    const key = dashboard.workspaceId || 'global';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(dashboard);
    return groups;
  }, {} as Record<string, typeof dashboards>);
  
  // Get workspace name by ID
  const getWorkspaceName = (id: string) => {
    const workspace = workspaces.find(ws => ws.id === id);
    return workspace ? workspace.title : 'Unknown Workspace';
  };
  
  return (
    <div className="h-full flex flex-col">
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
      </div>
      
      <div className="flex-1 overflow-auto">
        {dashboardView === 'view' ? (
          <WorkspaceDashboardPage workspaceId={currentWorkspaceId} hideCreateButton={true} />
        ) : (
          <div className="p-4">
            <h3 className="text-lg font-medium mb-4">Available Dashboards</h3>
            
            {dashboards.length === 0 ? (
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
                                onClick={() => {
                                  setSelectedDashboard(dashboard.id);
                                  setDashboardView('view');
                                }}
                              >
                                View
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
                )}
                
                {/* Workspace-specific dashboards */}
                {Object.entries(groupedDashboards)
                  .filter(([key]) => key !== 'global')
                  .map(([workspaceId, dashboardList]) => (
                    <div key={workspaceId}>
                      <h4 className="text-md font-medium mb-3 flex items-center">
                        <span>Workspace: {getWorkspaceName(workspaceId)}</span>
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
                                  onClick={() => {
                                    setSelectedDashboard(dashboard.id);
                                    setDashboardView('view');
                                  }}
                                >
                                  View
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
                  ))
                }
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
              <Label htmlFor="dashboard-workspace">Associate with Workspace</Label>
              <Select 
                value={selectedWorkspaceId} 
                onValueChange={setSelectedWorkspaceId}
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
            <Button onClick={handleCreateDashboard} disabled={!newDashboardName.trim()}>
              Create
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
    </div>
  );
};

export default DashboardPanel;