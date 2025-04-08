// src/components/WorkspaceList.tsx
import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';

export const WorkspaceList: React.FC = () => {
  const { workspaces, createWorkspace } = useAppStore();
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const navigate = useNavigate();

  const handleCreate = () => {
    if (newWorkspaceName.trim()) {
      const newWorkspace = createWorkspace(newWorkspaceName);
      setNewWorkspaceName('');
      
      // Navigate to the new workspace
      navigate(`/${newWorkspace.id}`);
    }
  };

  const handleSelect = (workspaceId: string) => {
    // Navigate to the selected workspace
    navigate(`/${workspaceId}`);
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>
      
      <div className="flex mb-4">
        <input 
          type="text" 
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="New Workspace Name"
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
        {workspaces.map(workspace => (
          <div 
            key={workspace.id} 
            onClick={() => handleSelect(workspace.id)}
            className="bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-100"
          >
            <h2 className="font-semibold">{workspace.name}</h2>
            <p className="text-sm text-gray-500">
              {workspace.scenarios.length} scenarios
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};