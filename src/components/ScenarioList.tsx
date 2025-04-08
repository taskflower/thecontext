// src/components/ScenarioList.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { useNavigate, useParams } from 'react-router-dom';

export const ScenarioList: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const { workspaces, selectWorkspace, createScenario } = useAppStore();
  const [newScenarioName, setNewScenarioName] = useState('');
  const navigate = useNavigate();

  // Set the selected workspace based on URL param
  useEffect(() => {
    if (workspaceId) {
      selectWorkspace(workspaceId);
    }
  }, [workspaceId, selectWorkspace]);

  const currentWorkspace = workspaces.find(w => w.id === workspaceId);

  const handleCreate = () => {
    if (newScenarioName.trim() && workspaceId) {
      const newScenario = createScenario(workspaceId, { name: newScenarioName });
      setNewScenarioName('');
      
      // Navigate to the new scenario
      navigate(`/${workspaceId}/${newScenario.id}`);
    }
  };

  const handleSelect = (scenarioId: string) => {
    // Navigate to the selected scenario
    navigate(`/${workspaceId}/${scenarioId}`);
  };

  if (!currentWorkspace) return <div>Workspace not found</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          {currentWorkspace.name} - Scenarios
        </h1>
        <button 
          onClick={() => navigate('/')}
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
        {currentWorkspace.scenarios.map(scenario => (
          <div 
            key={scenario.id} 
            onClick={() => handleSelect(scenario.id)}
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