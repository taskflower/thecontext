/* eslint-disable @typescript-eslint/no-explicit-any */
// src/dynamicComponents/DynamicCounter.tsx
import React, { useState } from 'react';
import { Workspace, Scenario, FlowNode } from '../features/types';

interface AppContext {
  currentWorkspace: Workspace | undefined;
  currentScenario: Scenario | undefined;
  currentNode: FlowNode | undefined;
  selection: {
    workspaceId: string;
    scenarioId: string;
    nodeId: string;
  };
  stateVersion: number;
}

interface DynamicCounterProps {
  data?: {
    initialCount?: number;
    label?: string;
    [key: string]: any;
  };
  appContext?: AppContext;
}

// This component will be loaded dynamically - it's not imported in App.tsx
const DynamicCounter: React.FC<DynamicCounterProps> = ({ data, appContext }) => {
  const initialCount = data?.initialCount || 0;
  const label = data?.label || 'Dynamic Counter';
  
  const [count, setCount] = useState(initialCount);
  
  // Get selected data from app context
  const { currentWorkspace, currentScenario, currentNode, selection } = appContext || {};
  
  return (
    <div className="p-4 bg-blue-50 rounded-md">
      <h3 className="text-lg font-medium">{label}</h3>
      <p className="mb-3">Count: {count}</p>
      
      <div className="flex gap-3 mb-4">
        <button 
          onClick={() => setCount(count - 1)} 
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Decrement
        </button>
        
        <button 
          onClick={() => setCount(count + 1)} 
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Increment
        </button>
      </div>
      
      <div className="mt-3 p-3 bg-white rounded-md">
        <h4 className="font-medium mb-2">Current App Selection:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li><span className="font-medium">Workspace ID:</span> {selection?.workspaceId || 'None'}</li>
          <li><span className="font-medium">Workspace Title:</span> {currentWorkspace?.title || 'None'}</li>
          <li><span className="font-medium">Scenario ID:</span> {selection?.scenarioId || 'None'}</li>
          <li><span className="font-medium">Scenario Name:</span> {currentScenario?.name || 'None'}</li>
          <li><span className="font-medium">Node ID:</span> {selection?.nodeId || 'None'}</li>
          <li><span className="font-medium">Node Label:</span> {currentNode?.label || 'None'}</li>
          <li><span className="font-medium">Node Value:</span> {currentNode?.value || 'None'}</li>
        </ul>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-600">This component was loaded dynamically and shows real app data!</p>
      </div>
    </div>
  );
};

// This self-registration will run when the file is loaded
if (typeof window !== 'undefined' && window.__DYNAMIC_COMPONENTS__) {
  window.__DYNAMIC_COMPONENTS__.register('DynamicCounter', DynamicCounter);
  console.log('DynamicCounter registered itself');
}

export default DynamicCounter;