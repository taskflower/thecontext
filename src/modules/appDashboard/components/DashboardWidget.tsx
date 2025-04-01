import React, { useState, useMemo } from 'react';
import { DashboardWidgetConfig } from '../types';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { Card } from '../../../components/ui/card';
import { Settings, RefreshCw, X, AlertTriangle, Loader2 } from 'lucide-react';
import { lazy, Suspense } from 'react';

// Lazy load dialog for better performance
const EditWidgetDialog = lazy(() => import('./EditWidgetDialog'));

interface DashboardWidgetProps {
  widget: DashboardWidgetConfig;
  dashboardId: string;
}

/**
 * Component for widget error state
 */
const WidgetErrorState = ({ title, pluginKey, onDelete }: { 
  title: string, 
  pluginKey: string, 
  onDelete: () => void 
}) => (
  <Card className="shadow-sm overflow-hidden">
    <div className="flex justify-between items-center p-3 border-b">
      <h3 className="font-medium text-sm">{title}</h3>
      <button 
        onClick={onDelete} 
        className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-muted/50 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <div className="p-4 bg-muted/10 text-center">
      <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
      <p className="text-sm font-medium">Plugin not found</p>
      <p className="text-xs text-muted-foreground mt-1">{pluginKey}</p>
    </div>
  </Card>
);

/**
 * Widget header component
 */
const WidgetHeader = ({ 
  title, 
  onRefresh, 
  onEdit, 
  onDelete 
}: { 
  title: string, 
  onRefresh: () => void, 
  onEdit: () => void, 
  onDelete: () => void 
}) => (
  <div className="flex justify-between items-center p-2 px-3 border-b bg-muted/10">
    <h3 className="font-medium text-sm">{title}</h3>
    <div className="flex space-x-1">
      <button 
        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
        onClick={onRefresh}
        title="Refresh Widget"
      >
        <RefreshCw className="h-3.5 w-3.5" />
      </button>
      <button 
        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
        onClick={onEdit}
        title="Widget Settings"
      >
        <Settings className="h-3.5 w-3.5" />
      </button>
      <button 
        className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-muted/50 transition-colors"
        onClick={onDelete}
        title="Remove Widget"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  </div>
);

/**
 * Loading state component
 */
const WidgetLoadingState = ({ title }: { title: string }) => (
  <Card className="shadow-sm overflow-hidden">
    <div className="flex justify-between items-center p-3 border-b">
      <h3 className="font-medium text-sm">{title}</h3>
    </div>
    <div className="p-4 flex items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  </Card>
);

/**
 * Dashboard widget component that renders a widget based on its configuration
 */
const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, dashboardId }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Get store functions directly for better performance
  const updateWidget = useDashboardStore.getState().updateWidget;
  const deleteWidget = useDashboardStore.getState().deleteWidget;
  
  // Get plugin information
  const { getPluginComponent, getPluginType, isLoaded } = usePlugins();
  
  // Calculate plugin component information
  const pluginInfo = useMemo(() => {
    if (!isLoaded) {
      return { isLoading: true, component: null, isValidType: false };
    }
    
    try {
      const pluginType = getPluginType(widget.pluginKey);
      const component = getPluginComponent(widget.pluginKey);
      
      return {
        isLoading: false,
        component,
        isValidType: pluginType === 'dashboard'
      };
    } catch (err) {
      console.error(`Error loading plugin ${widget.pluginKey}:`, err);
      return { isLoading: false, component: null, isValidType: false };
    }
  }, [getPluginComponent, getPluginType, widget.pluginKey, isLoaded]);
  
  // Create a static app context to prevent unnecessary re-renders
  const appContext = useMemo(() => ({
    currentWorkspace: null,
    currentScenario: null,
    currentNode: null,
    selection: {
      workspaceId: '',
      scenarioId: '',
      nodeId: ''
    },
    stateVersion: 0,
    getContextItems: () => []
  }), []);
  
  // Widget action handlers
  function handleRefresh() {
    setRefreshKey(prev => prev + 1);
  }
  
  function handleConfigChange(config: Partial<DashboardWidgetConfig>) {
    try {
      updateWidget(dashboardId, widget.id, config);
    } catch (e) {
      console.error('Error updating widget config:', e);
    }
  }
  
  function handleDelete() {
    try {
      deleteWidget(dashboardId, widget.id);
    } catch (e) {
      console.error('Error deleting widget:', e);
    }
  }
  
  function openEditDialog() {
    setIsEditDialogOpen(true);
  }
  
  function closeEditDialog() {
    setIsEditDialogOpen(false);
  }
  
  // Handle loading state
  if (pluginInfo.isLoading) {
    return <WidgetLoadingState title={widget.title} />;
  }
  
  // Handle invalid plugin type or missing plugin
  if (!pluginInfo.component || !pluginInfo.isValidType) {
    return (
      <WidgetErrorState 
        title={widget.title} 
        pluginKey={widget.pluginKey} 
        onDelete={handleDelete} 
      />
    );
  }
  
  // Render widget with plugin component
  const PluginComponent = pluginInfo.component;
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <WidgetHeader 
        title={widget.title}
        onRefresh={handleRefresh}
        onEdit={openEditDialog}
        onDelete={handleDelete}
      />
      
      <div 
        className="overflow-hidden" 
        style={{ height: `${widget.size.height}px` }}
      >
        <ErrorBoundary fallback={
          <div className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-medium">Widget Error</p>
            <p className="text-xs text-muted-foreground mt-1">
              An error occurred while loading this widget.
            </p>
            <button
              onClick={handleRefresh}
              className="mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20"
            >
              Try Again
            </button>
          </div>
        }>
          <PluginComponent
            key={refreshKey} // Force re-render on refresh
            data={widget.pluginData}
            appContext={appContext}
            widgetConfig={widget}
            widgetId={widget.id}
            dashboardId={dashboardId}
            onRefresh={handleRefresh}
            onConfigChange={handleConfigChange}
          />
        </ErrorBoundary>
      </div>
      
      {isEditDialogOpen && (
        <Suspense fallback={<div className="text-center p-4">Loading editor...</div>}>
          <EditWidgetDialog
            dashboardId={dashboardId}
            widgetId={widget.id}
            onClose={closeEditDialog}
          />
        </Suspense>
      )}
    </Card>
  );
};

// Error boundary to catch errors in widget plugins
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Widget error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Use React.memo with custom comparison function to prevent unnecessary re-renders
const areEqual = (prevProps: DashboardWidgetProps, nextProps: DashboardWidgetProps) => {
  // Compare dashboard ID
  if (prevProps.dashboardId !== nextProps.dashboardId) {
    return false;
  }
  
  // Compare basic widget properties
  if (prevProps.widget.id !== nextProps.widget.id || 
      prevProps.widget.title !== nextProps.widget.title ||
      prevProps.widget.pluginKey !== nextProps.widget.pluginKey) {
    return false;
  }
  
  // Compare dimensions
  if (prevProps.widget.size.height !== nextProps.widget.size.height ||
      prevProps.widget.size.width !== nextProps.widget.size.width) {
    return false;
  }
  
  // Shallow compare pluginData
  const prevData = prevProps.widget.pluginData || {};
  const nextData = nextProps.widget.pluginData || {};
  const prevKeys = Object.keys(prevData);
  const nextKeys = Object.keys(nextData);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (const key of prevKeys) {
    if (prevData[key] !== nextData[key]) {
      return false;
    }
  }
  
  return true;
};

export default React.memo(DashboardWidget, areEqual);