// src/modules/plugins/MinimalPluginWrapper.tsx
import React from 'react';
import { usePlugins } from '../pluginContext';
import { PluginComponentProps } from '../types';


interface MinimalPluginWrapperProps {
  componentKey: string;
}

const MinimalPluginWrapper: React.FC<MinimalPluginWrapperProps> = ({ 
  componentKey 
}) => {
  // Use plugin context to get component and data
  const { getPluginComponent, getPluginData } = usePlugins();
  
  // Get component from the plugin context
  const component = getPluginComponent(componentKey);
  
  // Get plugin data 
  const componentData = getPluginData(componentKey);
  
  // Create minimal context data (required by PluginComponentProps interface)
  const appContextData = {
    currentWorkspace: null,
    currentScenario: null,
    currentNode: null,
    selection: {
      workspaceId: '',
      scenarioId: '',
      nodeId: ''
    },
    stateVersion: 0
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
      {/* Simple header */}
      <div className="border-b border-border py-2 px-4 bg-muted/10">
        <h3 className="text-base font-medium">{componentKey}</h3>
      </div>
      
      {/* Plugin container */}
      <div className="p-4 bg-background">
        <Component data={componentData} appContext={appContextData} />
      </div>
    </div>
  );
};

export default MinimalPluginWrapper;