import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Card } from '../../../components/ui/card';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { DashboardWidgetConfig } from '../types';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';

interface AddWidgetDialogProps {
  dashboardId: string;
  onClose: () => void;
}

interface PluginOption {
  key: string;
  name: string;
  description?: string;
}

/**
 * Plugin option card for preview
 */
const PluginOptionCard = ({ 
  plugin, 
  isSelected, 
  onSelect 
}: { 
  plugin: PluginOption; 
  isSelected: boolean; 
  onSelect: () => void; 
}) => (
  <Card 
    className={`p-3 cursor-pointer border-2 transition-colors ${
      isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/50'
    }`}
    onClick={onSelect}
  >
    <h3 className="font-medium">{plugin.name || plugin.key}</h3>
    {plugin.description && (
      <p className="text-xs text-muted-foreground mt-1">{plugin.description}</p>
    )}
  </Card>
);

const AddWidgetDialog: React.FC<AddWidgetDialogProps> = ({ dashboardId, onClose }) => {
  const [title, setTitle] = useState('');
  const [pluginKey, setPluginKey] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Get access to dashboard store functions
  const addWidget = useDashboardStore(state => state.addWidget);
  
  // Get plugin system functions
  const { getPluginsByType, isLoaded } = usePlugins();
  
  // Set loading state based on plugin system loading state
  useEffect(() => {
    setIsLoading(!isLoaded);
  }, [isLoaded]);
  
  // Safely get dashboard plugins
  const dashboardPlugins = useMemo(() => {
    if (!isLoaded) return [];
    
    try {
      // Get plugins of type 'dashboard'
      const plugins = getPluginsByType('dashboard');
      
      // Map to simplified structure
      return plugins.map(plugin => ({
        key: plugin.key,
        name: plugin.key, // Use key as name since plugins might not have names
        description: plugin.description
      }));
    } catch (err) {
      console.error('Error getting dashboard plugins:', err);
      setError('Failed to load dashboard plugins');
      return [];
    }
  }, [getPluginsByType, isLoaded]);
  
  // Check if plugins are available
  const noPluginsAvailable = dashboardPlugins.length === 0;
  
  // Handle form submission
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!title.trim()) {
      setError('Please enter a widget title');
      return;
    }
    
    if (!pluginKey) {
      setError('Please select a plugin');
      return;
    }
    
    try {
      // Create widget configuration
      const newWidget: Omit<DashboardWidgetConfig, 'id'> = {
        title: title.trim(),
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
      
      // Add the widget to the dashboard
      const widgetId = addWidget(dashboardId, newWidget);
      if (!widgetId) {
        throw new Error('Failed to add widget');
      }
      
      // Close the dialog on success
      onClose();
    } catch (err) {
      setError(`Error adding widget: ${err instanceof Error ? err.message : String(err)}`);
    }
  }, [addWidget, dashboardId, onClose, pluginKey, title]);
  
  // Handler for selecting a plugin
  const selectPlugin = useCallback((key: string) => {
    setPluginKey(key);
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground mt-4">Loading plugins...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
          <DialogDescription>
            Add a new widget to your dashboard by selecting a plugin and providing a title.
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="widget-title">Widget Title</Label>
            <Input
              id="widget-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter widget title"
              autoFocus
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label className="mb-2">Select Plugin</Label>
            {noPluginsAvailable ? (
              <div className="text-center p-4 border rounded-md bg-muted/10">
                <p className="text-sm text-muted-foreground">
                  No dashboard plugins available
                </p>
              </div>
            ) : dashboardPlugins.length <= 4 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {dashboardPlugins.map((plugin) => (
                  <PluginOptionCard
                    key={plugin.key}
                    plugin={plugin}
                    isSelected={pluginKey === plugin.key}
                    onSelect={() => selectPlugin(plugin.key)}
                  />
                ))}
              </div>
            ) : (
              <Select value={pluginKey} onValueChange={setPluginKey}>
                <SelectTrigger id="plugin-select">
                  <SelectValue placeholder="Select a plugin" />
                </SelectTrigger>
                <SelectContent>
                  {dashboardPlugins.map((plugin) => (
                    <SelectItem key={plugin.key} value={plugin.key}>
                      {plugin.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || !pluginKey || noPluginsAvailable}>
              Add Widget
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(AddWidgetDialog);