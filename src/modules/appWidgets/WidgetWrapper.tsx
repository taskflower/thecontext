/**
 * Widget wrapper component
 */
import React, { useState } from 'react';
import { useWidgetStore } from './widgetStore';
import { getWidget } from './widgetRegistry';
import { WidgetComponentProps, WidgetConfig } from './types';
import { Card } from '@/components/ui/card';
import { Settings, Trash2, Grip } from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface WidgetWrapperProps {
  widget: WidgetConfig;
  dashboardId: string;
}

/**
 * Widget wrapper component
 * Renders a widget with standard controls and error handling
 */
export function WidgetWrapper({ widget, dashboardId }: WidgetWrapperProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editedTitle, setEditedTitle] = useState(widget.title);
  const [editedHeight, setEditedHeight] = useState(widget.height);
  const [isError, setIsError] = useState(false);
  
  // Get widget component from registry
  const widgetInfo = getWidget(widget.widgetType);
  
  // If widget type not found, show error
  if (!widgetInfo || !widgetInfo.component) {
    return (
      <Card className="overflow-hidden">
        <div className="p-2 border-b bg-muted/20 flex justify-between items-center">
          <div className="font-medium text-sm truncate">{widget.title}</div>
          <Button variant="ghost" size="sm" onClick={() => 
            useWidgetStore.getState().deleteWidget(dashboardId, widget.id)
          }>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">
            Widget type '{widget.widgetType}' not found
          </p>
        </div>
      </Card>
    );
  }
  
  // Get update functions from store
  const { updateWidget, deleteWidget } = useWidgetStore.getState();
  
  // Widget component props
  const componentProps: WidgetComponentProps = {
    widgetId: widget.id,
    dashboardId,
    title: widget.title,
    height: widget.height,
    config: widget.config || {},
    updateConfig: (config) => {
      updateWidget(dashboardId, widget.id, { config });
    },
    updateHeight: (height) => {
      updateWidget(dashboardId, widget.id, { height });
    },
    updateTitle: (title) => {
      updateWidget(dashboardId, widget.id, { title });
    },
    deleteWidget: () => {
      deleteWidget(dashboardId, widget.id);
    },
  };
  
  // Handle settings save
  const handleSaveSettings = () => {
    updateWidget(dashboardId, widget.id, {
      title: editedTitle,
      height: editedHeight,
    });
    setIsSettingsOpen(false);
  };
  
  // Handle widget error
  const handleWidgetError = () => {
    setIsError(true);
  };
  
  // The widget component
  const WidgetComponent = widgetInfo.component;
  
  return (
    <>
      <Card className="overflow-hidden">
        {/* Widget header */}
        <div className="px-3 py-2 border-b bg-muted/20 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Grip className="h-3 w-3 text-muted-foreground cursor-move" />
            <div className="font-medium text-sm truncate" title={widget.title}>
              {widget.title}
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Settings"
              onClick={() => {
                setEditedTitle(widget.title);
                setEditedHeight(widget.height);
                setIsSettingsOpen(true);
              }}
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" title="Remove"
              onClick={() => deleteWidget(dashboardId, widget.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        
        {/* Widget content */}
        <div 
          className="overflow-hidden" 
          style={{ height: `${widget.height}px` }}
        >
          {/* Error state */}
          {isError ? (
            <div className="p-4 text-center h-full flex flex-col items-center justify-center">
              <p className="text-sm text-destructive font-medium">
                An error occurred in this widget
              </p>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                The widget could not be rendered properly
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsError(false)}
              >
                Try Again
              </Button>
            </div>
          ) : (
            // Render widget component in error boundary
            <ErrorBoundary onError={handleWidgetError}>
              <WidgetComponent {...componentProps} />
            </ErrorBoundary>
          )}
        </div>
      </Card>
      
      {/* Settings dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Widget Settings</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="widget-title">Title</Label>
              <Input
                id="widget-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="widget-height">Height (pixels)</Label>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <Slider
                    value={[editedHeight]}
                    min={100}
                    max={800}
                    step={10}
                    onValueChange={(values) => setEditedHeight(values[0])}
                  />
                </div>
                <div className="w-16">
                  <Input
                    id="widget-height"
                    type="number"
                    value={editedHeight}
                    onChange={(e) => setEditedHeight(Number(e.target.value))}
                    min={100}
                    max={800}
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                Widget Type: {widgetInfo.name}
              </p>
              {widgetInfo.description && (
                <p className="text-xs text-muted-foreground mt-1">
                  {widgetInfo.description}
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Error boundary component for widgets
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onError: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Widget error:', error, errorInfo);
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle the error state
    }
    return this.props.children;
  }
}

export default WidgetWrapper;