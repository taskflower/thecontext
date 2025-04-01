import React, { useState, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { DashboardWidgetConfig } from '../types';

interface AddWidgetDialogProps {
  dashboardId: string;
  onClose: () => void;
}

const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({ dashboardId, onClose }) => {
  const [title, setTitle] = useState('');
  const [pluginKey, setPluginKey] = useState('');
  
  const { getPluginsByType } = usePlugins();
  const { addWidget } = useDashboardStore();
  
  const dashboardPlugins = getPluginsByType('dashboard');
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !pluginKey) return;
    
    const newWidget: Omit<DashboardWidgetConfig, 'id'> = {
      title,
      pluginKey,
      size: {
        width: 1,
        height: 300,
      },
      position: {
        x: 0,
        y: 0,
      },
      pluginData: {},
    };
    
    addWidget(dashboardId, newWidget);
    onClose();
  }, [addWidget, dashboardId, onClose, pluginKey, title]);
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="plugin-select">Select Plugin</Label>
            <Select value={pluginKey} onValueChange={setPluginKey}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plugin" />
              </SelectTrigger>
              <SelectContent>
                {dashboardPlugins.length > 0 ? (
                  dashboardPlugins.map((plugin) => (
                    <SelectItem key={plugin.key} value={plugin.key}>
                      {plugin.key}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No dashboard plugins available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || !pluginKey}>
              Add Widget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddWidgetDialog;