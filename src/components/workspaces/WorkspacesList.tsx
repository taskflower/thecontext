// components/workspaces/WorkspacesList.tsx
import React from 'react';
import WorkspaceItem from './WorkspaceItem';
import useStore from '@/store';

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
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Workspaces</h2>
        <button 
          onClick={handleCreate}
          className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] h-6 w-6 rounded-full flex items-center justify-center hover:bg-opacity-90"
          title="Dodaj workspace"
        >+</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map(workspace => (
          <WorkspaceItem 
            key={workspace.id} 
            workspace={workspace} 
          />
        ))}
        
        {workspaces.length === 0 && (
          <div className="text-[hsl(var(--muted-foreground))] text-sm italic py-2">
            Brak workspace'ów
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspacesList;