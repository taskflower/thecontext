// src/modules/plugins/PluginWrapper.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import useDynamicComponentStore from './pluginsStore';
import { useAppStore } from '../store';

interface DynamicComponentWrapperProps {
  componentKey: string;
}

const DynamicComponentWrapper: React.FC<DynamicComponentWrapperProps> = ({ componentKey }) => {
  const [inputData, setInputData] = useState<string>('');
  const [currentData, setCurrentData] = useState<any>(null);
  
  // Get app state data
  const workspaceId = useAppStore(state => state.selected.workspace);
  const scenarioId = useAppStore(state => state.selected.scenario);
  const nodeId = useAppStore(state => state.selected.node);
  const stateVersion = useAppStore(state => state.stateVersion);
  
  // Get workspace, scenario, and node details
  const workspace = useAppStore(state => state.items.find(w => w.id === workspaceId));
  const scenario = workspace?.children.find(s => s.id === scenarioId);
  const node = scenario?.children.find(n => n.id === nodeId);
  
  // Get component from the dynamic component store
  const component = useDynamicComponentStore(state => state.getComponent(componentKey));
  const componentData = useDynamicComponentStore(state => state.getComponentData(componentKey));
  const setComponentData = useDynamicComponentStore(state => state.setComponentData);
  
  // Update currentData when componentData changes
  useEffect(() => {
    setCurrentData(componentData);
  }, [componentData]);

  // Create the app context data that will be passed to the component
  const appContextData = {
    currentWorkspace: workspace,
    currentScenario: scenario,
    currentNode: node,
    selection: {
      workspaceId,
      scenarioId,
      nodeId
    },
    stateVersion
  };
  
  if (!component) {
    return <div>Component not found: {componentKey}</div>;
  }
  
  const Component = component;
  
  const handleSendData = () => {
    try {
      const parsedData = inputData.trim() ? JSON.parse(inputData) : null;
      setComponentData(componentKey, parsedData);
    } catch (e) {
      alert(`Invalid JSON format: ${(e as Error).message}`);
    }
  };
  
  return (
    <div className="border border-gray-300 p-4 my-3 rounded-md">
      <h3 className="text-lg font-medium">Component: {componentKey}</h3>
      
      <div className="my-4 p-3 bg-gray-100">
        <Component data={componentData} appContext={appContextData} />
      </div>
      
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2">Custom Component Data:</h4>
            <textarea
              value={inputData}
              onChange={(e) => setInputData(e.target.value)}
              placeholder="Enter JSON data to send to component"
              className="w-full h-24 p-2 border border-gray-300 rounded-md"
            />
            
            <button 
              onClick={handleSendData}
              className="mt-2 px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer hover:bg-blue-600"
            >
              Send Data to Component
            </button>
          </div>
          
          <div>
            <h4 className="font-medium mb-2">Current App Context:</h4>
            <textarea
              value={JSON.stringify(appContextData, null, 2)}
              readOnly
              className="w-full h-40 p-2 bg-gray-50 border border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Current Component Data:</h4>
          <textarea
            value={currentData ? JSON.stringify(currentData, null, 2) : ''}
            readOnly
            className="w-full h-24 p-2 bg-gray-50 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicComponentWrapper;