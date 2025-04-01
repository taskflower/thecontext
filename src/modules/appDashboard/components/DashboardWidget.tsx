import React, { useCallback } from 'react';
import { DashboardWidgetConfig } from '../types';
import { usePlugins } from '../../plugins/pluginContext';
import { useDashboardStore } from '../dashboardStore';
import { Card } from '../../../components/ui/card';

interface DashboardWidgetProps {
  widget: DashboardWidgetConfig;
  dashboardId: string;
}

const DashboardWidget: React.FC<DashboardWidgetProps> = ({ widget, dashboardId }) => {
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
  
  if (!PluginComponent || pluginType !== 'dashboard') {
    return (
      <Card className="p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">{widget.title}</h3>
          <button onClick={handleDelete} className="text-red-500 text-sm">Remove</button>
        </div>
        <div className="p-4 bg-gray-100 rounded text-center">
          Plugin not found: {widget.pluginKey}
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-3 border-b bg-gray-50">
        <h3 className="font-medium">{widget.title}</h3>
        <div className="flex space-x-2">
          <button 
            className="text-gray-500 hover:text-gray-700 text-sm"
            onClick={handleRefresh}
          >
            Refresh
          </button>
          <button 
            className="text-red-500 hover:text-red-700 text-sm"
            onClick={handleDelete}
          >
            Remove
          </button>
        </div>
      </div>
      
      <div className="p-4" style={{ height: `${widget.size.height}px` }}>
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
            stateVersion: 0
          }}
          widgetConfig={widget}
          widgetId={widget.id}
          dashboardId={dashboardId}
          onRefresh={handleRefresh}
          onConfigChange={handleConfigChange}
        />
      </div>
    </Card>
  );
};

export default DashboardWidget;