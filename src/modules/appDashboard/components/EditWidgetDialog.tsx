// src/modules/appDashboard/components/EditWidgetDialog.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Checkbox } from '../../../components/ui/checkbox';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { DashboardWidgetConfig } from '../types';
import { PluginOptionSchema } from '../../plugins/types';

interface EditWidgetDialogProps {
  dashboardId: string;
  widgetId: string;
  onClose: () => void;
}

const EditWidgetDialog: React.FC<EditWidgetDialogProps> = ({ 
  dashboardId, 
  widgetId, 
  onClose 
}) => {
  const { updateWidget, getWidget } = useDashboardStore();
  const { getPluginComponent } = usePlugins();
  
  // Get the current widget
  const widget = getWidget(dashboardId, widgetId);
  
  // Settings state
  const [title, setTitle] = useState(widget?.title || '');
  const [pluginData, setPluginData] = useState<Record<string, any>>(
    widget?.pluginData || {}
  );
  const [currentTab, setCurrentTab] = useState<'general' | 'appearance'>('general');
  
  // Get the widget component to access its optionsSchema
  const WidgetComponent = widget ? getPluginComponent(widget.pluginKey) : null;
  const optionsSchema = WidgetComponent && 'optionsSchema' in WidgetComponent 
    ? (WidgetComponent as any).optionsSchema 
    : {};
  
  useEffect(() => {
    if (widget) {
      setTitle(widget.title);
      setPluginData(widget.pluginData || {});
    }
  }, [widget]);
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!widget) return;
    
    updateWidget(dashboardId, widgetId, {
      title,
      pluginData
    });
    
    onClose();
  }, [dashboardId, onClose, pluginData, title, updateWidget, widgetId, widget]);
  
  const handlePluginDataChange = useCallback((key: string, value: any) => {
    setPluginData(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);
  
  // Render form field based on plugin option schema
  const renderFormField = (key: string, schema: PluginOptionSchema) => {
    const value = pluginData[key] !== undefined 
      ? pluginData[key] 
      : schema.default;
    
    switch (schema.type) {
      case 'string':
        return schema.inputType === 'textarea' ? (
          <Textarea
            id={`option-${key}`}
            value={value || ''}
            onChange={(e) => handlePluginDataChange(key, e.target.value)}
            placeholder={schema.description}
            className="resize-none"
          />
        ) : (
          <Input
            id={`option-${key}`}
            type={schema.inputType || 'text'}
            value={value || ''}
            onChange={(e) => handlePluginDataChange(key, e.target.value)}
            placeholder={schema.description}
          />
        );
      
      case 'number':
        return (
          <Input
            id={`option-${key}`}
            type="number"
            value={value}
            onChange={(e) => handlePluginDataChange(key, parseFloat(e.target.value))}
            placeholder={schema.description}
          />
        );
      
      case 'boolean':
        return (
          <Switch
            id={`option-${key}`}
            checked={!!value}
            onCheckedChange={(checked) => handlePluginDataChange(key, checked)}
          />
        );
      
      case 'select':
        return (
          <Select 
            value={value} 
            onValueChange={(v) => handlePluginDataChange(key, v)}
          >
            <SelectTrigger>
              <SelectValue placeholder={schema.description} />
            </SelectTrigger>
            <SelectContent>
              {schema.options?.map((option) => (
                <SelectItem 
                  key={String(option.value)} 
                  value={String(option.value)}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      default:
        return (
          <Input
            id={`option-${key}`}
            value={value || ''}
            onChange={(e) => handlePluginDataChange(key, e.target.value)}
            placeholder={schema.description}
          />
        );
    }
  };
  
  if (!widget) {
    return null;
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Widget Settings</DialogTitle>
        </DialogHeader>
        
        <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {currentTab === 'general' && (
              <div className="space-y-4">
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
                
                {/* Plugin specific options */}
                {Object.entries(optionsSchema || {}).map(([key, schema]) => (
                  <div key={key} className="grid w-full items-center gap-1.5">
                    <Label htmlFor={`option-${key}`}>
                      {schema.label || key}
                    </Label>
                    {renderFormField(key, schema as PluginOptionSchema)}
                    {schema.description && (
                      <p className="text-xs text-muted-foreground">
                        {schema.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {currentTab === 'appearance' && (
              <div className="space-y-4">
                <div className="grid w-full items-center gap-1.5">
                  <Label htmlFor="widget-height">Height (pixels)</Label>
                  <Input
                    id="widget-height"
                    type="number"
                    value={widget.size.height}
                    onChange={(e) => {
                      updateWidget(dashboardId, widgetId, {
                        size: {
                          ...widget.size,
                          height: Number(e.target.value)
                        }
                      });
                    }}
                    min={100}
                    max={1000}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default EditWidgetDialog;