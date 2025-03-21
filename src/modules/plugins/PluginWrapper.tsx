// src/modules/plugins/PluginWrapper.tsx - fragment do modyfikacji

import React, { useState, useEffect } from 'react';
import { Code, Database, ArrowRightCircle, Info } from 'lucide-react';
import useDynamicComponentStore from './pluginsStore';
import { useAppStore } from '../store';
import { AppContextData } from './types';
import type { PluginComponentProps } from './types';
import { cn } from '@/utils/utils';

interface DynamicComponentWrapperProps {
  componentKey: string;
  nodeId?: string; // Opcjonalny ID węzła, jeśli plugin jest powiązany z węzłem
}

const DynamicComponentWrapper: React.FC<DynamicComponentWrapperProps> = ({ 
  componentKey,
  nodeId 
}) => {
  const [inputData, setInputData] = useState<string>('');
  const [currentData, setCurrentData] = useState<unknown>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showContext, setShowContext] = useState(false);
  
  // Get app state data
  const workspaceId = useAppStore(state => state.selected.workspace);
  const scenarioId = useAppStore(state => state.selected.scenario);
  const selectedNodeId = useAppStore(state => state.selected.node);
  const stateVersion = useAppStore(state => state.stateVersion);
  
  // Get workspace, scenario, and node details
  const workspace = useAppStore(state => state.items.find(w => w.id === workspaceId));
  const scenario = workspace?.children.find(s => s.id === scenarioId);
  const node = nodeId 
    ? scenario?.children.find(n => n.id === nodeId) 
    : scenario?.children.find(n => n.id === selectedNodeId);
  
  // Get component from the dynamic component store
  const component = useDynamicComponentStore(state => state.getComponent(componentKey));
  
  // Pobieramy dane z różnych źródeł w zależności od kontekstu
  const getPluginData = () => {
    // Jeśli mamy nodeId i node ma dane dla tego pluginu
    if (nodeId && node?.pluginData && componentKey in (node.pluginData || {})) {
      return node.pluginData[componentKey];
    }
    
    // W przeciwnym razie użyj globalnych danych pluginu
    return useDynamicComponentStore.getState().getComponentData(componentKey);
  };
  
  const componentData = getPluginData();
  
  // Funkcja aktualizująca dane pluginu
  const setComponentData = (data: unknown) => {
    if (nodeId && node) {
      // Jeśli mamy nodeId, aktualizujemy dane pluginu w węźle
      useAppStore.getState().updateNodePluginData(nodeId, componentKey, data);
    } else {
      // W przeciwnym razie aktualizujemy globalne dane pluginu
      useDynamicComponentStore.getState().setComponentData(componentKey, data);
    }
  };
  
  // Update currentData when componentData changes
  useEffect(() => {
    setCurrentData(componentData);
  }, [componentData, stateVersion]);

  // Create the app context data that will be passed to the component
  const appContextData: AppContextData = {
    currentWorkspace: workspace || null,
    currentScenario: scenario || null,
    currentNode: node || null,
    selection: {
      workspaceId,
      scenarioId,
      nodeId: selectedNodeId
    },
    stateVersion
  };
  
  if (!component) {
    return (
      <div className="p-6 bg-muted rounded-lg text-center text-muted-foreground">
        <p>Component not found: {componentKey}</p>
      </div>
    );
  }
  
  // Forcefully cast the component to the right type
  const Component = component as React.ComponentType<PluginComponentProps>;
  
  const handleSendData = () => {
    try {
      const parsedData = inputData.trim() ? JSON.parse(inputData) : null;
      setComponentData(parsedData);
    } catch (e) {
      alert(`Invalid JSON format: ${(e as Error).message}`);
    }
  };
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Component header */}
      <div className="border-b border-border py-3 px-4 bg-muted/10 flex items-center justify-between">
        <h3 className="text-base font-medium flex items-center">
          <Code className="h-4 w-4 mr-2 text-primary" />
          {componentKey}
          {nodeId && (
            <span className="ml-2 text-xs text-muted-foreground">(Node Plugin)</span>
          )}
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowContext(!showContext)}
            className={cn(
              "text-xs flex items-center px-2 py-1 rounded",
              showContext ? "bg-primary/10 text-primary" : "hover:bg-muted"
            )}
          >
            <Info className="h-3 w-3 mr-1" />
            Context
          </button>
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
      
      {/* Context panel */}
      {showContext && (
        <div className="border-b border-border p-3 bg-muted/5">
          <div className="flex items-center justify-between text-sm font-medium mb-2">
            <span className="flex items-center text-muted-foreground">
              <Info className="h-4 w-4 mr-1" />
              Current App Context
            </span>
          </div>
          <pre className="bg-muted/10 p-3 rounded-md text-xs overflow-auto max-h-40 whitespace-pre-wrap">
            {JSON.stringify(appContextData, null, 2)}
          </pre>
        </div>
      )}
      
      {/* Config panel */}
      {showConfig && (
        <div className="border-b border-border p-3 bg-muted/5">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center text-muted-foreground">
                  <ArrowRightCircle className="h-4 w-4 mr-1" />
                  Send Component Data
                </span>
              </div>
              <div className="flex space-x-2">
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder="Enter JSON data to send to component"
                  className="flex-1 p-2 text-xs border border-border rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary/30 min-h-[80px]"
                />
                <button 
                  onClick={handleSendData}
                  className="px-3 py-1 h-fit bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90"
                >
                  Send
                </button>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm font-medium mb-2">
                <span className="flex items-center text-muted-foreground">
                  <Database className="h-4 w-4 mr-1" />
                  Current Component Data
                  {nodeId && <span className="ml-1 text-xs">(Node Specific)</span>}
                </span>
              </div>
              <pre className="bg-muted/10 p-3 rounded-md text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                {currentData ? JSON.stringify(currentData, null, 2) : "null"}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicComponentWrapper;