// src/modules/plugins/ManagerPluginWrapper.tsx
import React, { useState } from 'react';
import { Code, Database } from 'lucide-react';

import { cn } from '@/utils/utils';
import { usePlugins } from '../pluginContext';
import { useAppStore } from '@/modules/store';
import { AppContextData, PluginComponentProps } from '../types';

interface ManagerPluginWrapperProps {
  componentKey: string;
}

const ManagerPluginWrapper: React.FC<ManagerPluginWrapperProps> = ({ 
  componentKey 
}) => {
  const [showConfig, setShowConfig] = useState(false);
  
  // Use plugin context
  const { 
    getPluginComponent, 
    getPluginData, 
    setPluginData 
  } = usePlugins();
  
  // Get app state data
  const workspaceId = useAppStore(state => state.selected.workspace);
  const scenarioId = useAppStore(state => state.selected.scenario);
  const selectedNodeId = useAppStore(state => state.selected.node);
  
  // Get workspace, scenario details
  const workspace = useAppStore(state => state.items.find(w => w.id === workspaceId));
  const scenario = workspace?.children.find(s => s.id === scenarioId);
  
  // Get component from the plugin context
  const component = getPluginComponent(componentKey);
  
  // Get plugin data
  const componentData = getPluginData(componentKey);
  
  // Create the app context data that will be passed to the component
  const appContextData: AppContextData = {
    currentWorkspace: workspace || null,
    currentScenario: scenario || null,
    currentNode: null,
    selection: {
      workspaceId,
      scenarioId,
      nodeId: selectedNodeId
    },
    stateVersion: useAppStore(state => state.stateVersion)
  };
  
  if (!component) {
    return (
      <div className="p-4 bg-muted rounded-lg text-center text-muted-foreground">
        <p>Component not found: {componentKey}</p>
      </div>
    );
  }
  
  // Cast the component to the right type
  const Component = component as React.ComponentType<PluginComponentProps>;
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Component header */}
      <div className="border-b border-border py-3 px-4 bg-muted/10 flex items-center justify-between">
        <h3 className="text-base font-medium flex items-center">
          <Code className="h-4 w-4 mr-2 text-primary" />
          {componentKey}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={cn(
              "text-xs flex items-center px-2 py-1 rounded",
              showConfig ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
          >
            <Database className="h-3 w-3 mr-1" />
            Config
          </button>
        </div>
      </div>
      
      {/* Component container */}
      <div className="p-4 border-b border-border bg-background">
        <Component data={componentData} appContext={appContextData} />
      </div>
      
      {/* Config panel */}
      {showConfig && (
        <div className="border-b border-border p-3 bg-muted/5">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center text-muted-foreground">
                  <Database className="h-4 w-4 mr-1" />
                  Component Data
                </span>
              </div>
              <pre className="bg-muted/10 p-3 rounded-md text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                {componentData ? JSON.stringify(componentData, null, 2) : "null"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerPluginWrapper;