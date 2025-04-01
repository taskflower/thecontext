// src/modules/appDashboard/components/EditWidgetDialog.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { Textarea } from '../../../components/ui/textarea';
import { Switch } from '../../../components/ui/switch';
import { Slider } from '../../../components/ui/slider';
import { debounce } from '../../../utils/utils';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { DashboardWidgetConfig } from '../types';
import { PluginOptionSchema } from '../../plugins/types';

interface EditWidgetDialogProps {
  dashboardId: string;
  widgetId: string;
  onClose: () => void;
}

/**
 * Individual form field component
 */
const PluginOptionField = ({ 
  id, 
  schema, 
  value, 
  onChange 
}: { 
  id: string; 
  schema: PluginOptionSchema; 
  value: any; 
  onChange: (value: any) => void; 
}) => {
  const currentValue = value !== undefined ? value : schema.default;
  
  switch (schema.type) {
    case 'string':
      return schema.inputType === 'textarea' ? (
        <Textarea
          id={id}
          value={currentValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.description}
          className="resize-none"
        />
      ) : (
        <Input
          id={id}
          type={schema.inputType || 'text'}
          value={currentValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.description}
        />
      );
    
    case 'number':
      return (
        <Input
          id={id}
          type="number"
          value={currentValue}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          placeholder={schema.description}
        />
      );
    
    case 'boolean':
      return (
        <Switch
          id={id}
          checked={!!currentValue}
          onCheckedChange={onChange}
        />
      );
    
    case 'select':
      return (
        <Select 
          value={String(currentValue)} 
          onValueChange={onChange}
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
          id={id}
          value={currentValue || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={schema.description}
        />
      );
  }
};

/**
 * Appearance tab content
 */
const AppearanceTab = ({ 
  widget, 
  dashboardId, 
  widgetId, 
  updateWidget 
}: { 
  widget: DashboardWidgetConfig; 
  dashboardId: string; 
  widgetId: string; 
  updateWidget: (dashboardId: string, widgetId: string, data: Partial<DashboardWidgetConfig>) => void; 
}) => {
  const [height, setHeight] = useState(widget.size.height);
  
  // Create a debounced update function
  const debouncedUpdateHeight = useCallback(
    debounce((newHeight: number) => {
      updateWidget(dashboardId, widgetId, {
        size: {
          ...widget.size,
          height: newHeight
        }
      });
    }, 300),
    [dashboardId, widgetId, widget.size, updateWidget]
  );
  
  const handleHeightChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = Number(e.target.value);
    setHeight(newHeight);
    debouncedUpdateHeight(newHeight);
  }, [debouncedUpdateHeight]);
  
  return (
    <div className="space-y-4">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="widget-height">Height (pixels)</Label>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Slider
              value={[height]}
              min={100}
              max={1000}
              step={10}
              onValueChange={(values) => {
                setHeight(values[0]);
                debouncedUpdateHeight(values[0]);
              }}
            />
          </div>
          <div className="w-16">
            <Input
              id="widget-height"
              type="number"
              value={height}
              onChange={handleHeightChange}
              min={100}
              max={1000}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const EditWidgetDialog: React.FC<EditWidgetDialogProps> = ({ 
  dashboardId, 
  widgetId, 
  onClose 
}) => {
  const { updateWidget, getWidget } = useDashboardStore(state => ({
    updateWidget: state.updateWidget,
    getWidget: state.getWidget
  }));
  
  const { getPluginComponent } = usePlugins();
  
  // Get the current widget
  const widget = getWidget(dashboardId, widgetId);
  
  // Settings state
  const [title, setTitle] = useState(widget?.title || '');
  const [pluginData, setPluginData] = useState<Record<string, any>>(
    widget?.pluginData || {}
  );
  const [currentTab, setCurrentTab] = useState<'general' | 'appearance'>('general');
  
  // Get the widget component and options schema
  const WidgetComponent = useMemo(() => 
    widget ? getPluginComponent(widget.pluginKey) : null, 
    [widget, getPluginComponent]
  );
  
  const optionsSchema = useMemo(() => 
    WidgetComponent && 'optionsSchema' in WidgetComponent 
      ? (WidgetComponent as any).optionsSchema 
      : {},
    [WidgetComponent]
  );
  
  // Reset form state when widget changes
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
  
  // Memoize options entries to avoid re-renders
  const optionsEntries = useMemo(() => 
    Object.entries(optionsSchema || {}),
    [optionsSchema]
  );
  
  if (!widget) {
    return null;
  }
  
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Widget Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={currentTab} onValueChange={(v) => setCurrentTab(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
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
              {optionsEntries.map(([key, schema]) => (
                <div key={key} className="grid w-full items-center gap-1.5">
                  <Label htmlFor={`option-${key}`}>
                    {schema.label || key}
                  </Label>
                  <PluginOptionField
                    id={`option-${key}`}
                    schema={schema as PluginOptionSchema}
                    value={pluginData[key]}
                    onChange={(value) => handlePluginDataChange(key, value)}
                  />
                  {schema.description && (
                    <p className="text-xs text-muted-foreground">
                      {schema.description}
                    </p>
                  )}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="appearance">
              <AppearanceTab
                widget={widget}
                dashboardId={dashboardId}
                widgetId={widgetId}
                updateWidget={updateWidget}
              />
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default React.memo(EditWidgetDialog);