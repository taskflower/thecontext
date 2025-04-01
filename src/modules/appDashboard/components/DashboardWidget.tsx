import React, { useCallback, useState } from 'react';
import { DashboardWidgetConfig } from '../types';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { Card } from '../../../components/ui/card';
import { Settings, RefreshCw, X } from 'lucide-react';
import EditWidgetDialog from './EditWidgetDialog';

interface DashboardWidgetProps {
  widget: DashboardWidgetConfig;
  dashboardId: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, dashboardId }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { getPluginComponent, getPluginType } = usePlugins();
  const { updateWidget, deleteWidget } = useDashboardStore();
  
  const pluginType = getPluginType(widget.pluginKey);
  const PluginComponent = getPluginComponent(widget.pluginKey);
  
  const handleRefresh = useCallback(() => {
    // Implement refresh logic if needed
    console.log('Refreshing widget:', widget.id);
  }, [widget.id]);
  
  const handleConfigChange = useCallback((config: Partial<DashboardWidgetConfig>) => {
    updateWidget(dashboardId, widget.id, config);
  }, [dashboardId, updateWidget, widget.id]);
  
  const handleDelete = useCallback(() => {
    deleteWidget(dashboardId, widget.id);
  }, [dashboardId, deleteWidget, widget.id]);
  
  const openEditDialog = useCallback(() => {
    setIsEditDialogOpen(true);
  }, []);
  
  const closeEditDialog = useCallback(() => {
    setIsEditDialogOpen(false);
  }, []);
  
  if (!PluginComponent || pluginType !== 'dashboard') {
    return (
      <Card className="shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-3 border-b">
          <h3 className="font-medium text-sm">{widget.title}</h3>
          <button 
            onClick={handleDelete} 
            className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-4 bg-muted/10 text-center">
          Plugin not found: {widget.pluginKey}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-2 px-3 border-b bg-muted/10">
        <h3 className="font-medium text-sm">{widget.title}</h3>
        <div className="flex space-x-1">
          <button 
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
            onClick={handleRefresh}
            title="Refresh Widget"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button 
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted/50 transition-colors"
            onClick={openEditDialog}
            title="Widget Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>
          <button 
            className="text-destructive/80 hover:text-destructive p-1 rounded-md hover:bg-muted/50 transition-colors"
            onClick={handleDelete}
            title="Remove Widget"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
      <div className="overflow-hidden" style={{ height: `${widget.size.height}px` }}>
        <PluginComponent
          data={widget.pluginData}
          appContext={{
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
          }}
          widgetConfig={widget}
          widgetId={widget.id}
          dashboardId={dashboardId}
          onRefresh={handleRefresh}
          onConfigChange={handleConfigChange}
        />
      </div>
      
      {/* Widget settings dialog */}
      {isEditDialogOpen && (
        <EditWidgetDialog
          dashboardId={dashboardId}
          widgetId={widget.id}
          onClose={closeEditDialog}
        />
      )}
    </Card>
  );
};

export default DashboardWidget;