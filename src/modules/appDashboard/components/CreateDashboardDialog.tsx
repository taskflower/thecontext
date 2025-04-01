import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { useDashboardStore } from '../dashboardStore';
import { DashboardConfig } from '../types';

interface CreateDashboardDialogProps {
  onClose: () => void;
}

const CreateDashboardDialog: React.FC<CreateDashboardDialogProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  
  const { createDashboard, setSelectedDashboard } = useDashboardStore();
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    const newDashboard: Omit<DashboardConfig, 'id'> = {
      name,
      widgets: [],
      metadata: {},
    };
    
    const dashboardId = createDashboard(newDashboard);
    setSelectedDashboard(dashboardId);
    onClose();
  }, [createDashboard, name, onClose, setSelectedDashboard]);
  
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