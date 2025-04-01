import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useDashboardStore } from '../dashboardStore';
import { useAppStore } from '@/modules/store';
import { DashboardConfig } from '../types';

interface CreateDashboardDialogProps {
  onClose: () => void;
  workspaceId?: string | null; // If undefined, show selection; if string, force that workspace; if null, force global
}

const CreateDashboardDialog: React.FC<CreateDashboardDialogProps> = ({ 
  onClose,
  workspaceId 
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(
    workspaceId === undefined ? null : workspaceId
  );
  
  // Get workspaces for selection if needed
  const workspaces = useAppStore(state => state.items);
  
  const { createDashboard, setSelectedDashboard } = useDashboardStore();
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newDashboard: Omit<DashboardConfig, 'id'> = {
      name,
      description: description || `Dashboard created on ${new Date().toLocaleDateString()}`,
      widgets: [],
      workspaceId: selectedWorkspaceId === null ? undefined : selectedWorkspaceId,
      metadata: {},
    };
    
    const dashboardId = createDashboard(newDashboard);
    setSelectedDashboard(dashboardId);
    onClose();
  }, [createDashboard, name, description, selectedWorkspaceId, onClose, setSelectedDashboard]);
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Dashboard</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter dashboard name"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="dashboard-description">Description</Label>
            <Input
              id="dashboard-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Dashboard description (optional)"
            />
          </div>
          
          {workspaceId === undefined && (
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="dashboard-workspace">Associate with Workspace</Label>
              <Select 
                value={selectedWorkspaceId || "none"} 
                onValueChange={(value) => setSelectedWorkspaceId(value === "none" ? null : value)}
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
                Associating with a workspace will make it appear in that workspace's page
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Create Dashboard
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDashboardDialog;