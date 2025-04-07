// components/workspaces/WorkspacesList.tsx
import React from 'react';
import useStore from '../../store';
import WorkspaceItem from './WorkspaceItem';
import { AddButton, EmptyState, Header } from '../theme';


const WorkspacesList: React.FC = () => {
  const workspaces = useStore(state => state.workspaces);
  const createWorkspace = useStore(state => state.createWorkspace);
  
  const handleCreate = () => {
    const name = prompt('Nazwa workspace:');
    if (name?.trim()) {
      createWorkspace(name);
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Header title="Workspaces" />
        <AddButton onClick={handleCreate} title="Dodaj workspace" />
      </div>
      
      <div className="space-y-2">
        {workspaces.map(workspace => (
          <WorkspaceItem 
            key={workspace.id} 
            workspace={workspace} 
          />
        ))}
        
        {workspaces.length === 0 && (
          <EmptyState message="Brak workspace'ów" />
        )}
      </div>
    </div>
  );
};

export default WorkspacesList;



