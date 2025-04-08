// src/components/ScenarioList.tsx
import React, { useState } from 'react';
import { useAppStore } from '../lib/store';


export const ScenarioList: React.FC = () => {
  const { 
    workspaces, 
    selectedWorkspace, 
    createScenario, 
    selectScenario 
  } = useAppStore();
  
  const [newScenarioName, setNewScenarioName] = useState('');
  
  const currentWorkspace = workspaces.find(w => w.id === selectedWorkspace);

  const handleCreate = () => {
    if (newScenarioName.trim() && selectedWorkspace) {
      createScenario(selectedWorkspace, { 
        name: newScenarioName 
      });
      setNewScenarioName('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {currentWorkspace?.name} - Scenarios
        </h1>
        <button 
          onClick={() => window.history.back()}
          className="text-sm text-gray-600"
        >
          Back to Workspaces
        </button>
      </div>
      
      <div className="flex mb-4">
        <input 
          type="text" 
          value={newScenarioName}
          onChange={(e) => setNewScenarioName(e.target.value)}
          placeholder="New Scenario Name"
          className="flex-grow mr-2 p-2 border rounded"
        />
        <button 
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Create
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentWorkspace?.scenarios.map(scenario => (
          <div 
            key={scenario.id} 
            onClick={() => selectScenario(scenario.id)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-100"
          >
            <h2 className="font-semibold">{scenario.name}</h2>
            <p className="text-sm text-gray-500">
              {scenario.nodes.length} nodes
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};