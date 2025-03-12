// src/modules/workspaces_module/components/WorkspacesList.tsx
import React from 'react';
import { Layers, Globe, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import MCard from "@/components/MCard";

import WorkspaceCard from './WorkspaceCard';
import { useWorkspaceStore } from '../workspaceStore';

const WorkspacesList: React.FC<{
  onCreateWorkspace: () => void;
  onSelectWorkspace: (id: string) => void;
  onEditWorkspace: (id: string) => void;
  onDeleteWorkspace: (id: string) => void;
}> = ({ 
  onCreateWorkspace, 
  onSelectWorkspace, 
  onEditWorkspace, 
  onDeleteWorkspace 
}) => {
  const { workspaces } = useWorkspaceStore();
  const workspacesList = Object.values(workspaces).sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <MCard
      title={
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 " />
          <span>Workspaces</span>
        </div>
      }
      description="Manage your analysis workspaces"
    >
      {workspacesList.length === 0 ? (
        <div className="text-center py-8 px-6 text-slate-500 bg-slate-50/50 rounded-md border border-dashed">
          <div className="flex flex-col items-center gap-2">
            <Globe className="h-12 w-12 text-slate-300" />
            <p className="text-slate-600 font-medium">No workspaces found</p>
            <p className="text-slate-500 text-sm">Create your first workspace to get started with your analysis.</p>
          </div>
          <Button 
            onClick={onCreateWorkspace}
            className="mt-4"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workspacesList.map(workspace => (
            <WorkspaceCard
              key={workspace.id}
              id={workspace.id}
              onSelect={() => onSelectWorkspace(workspace.id)}
              onEdit={() => onEditWorkspace(workspace.id)}
              onDelete={() => onDeleteWorkspace(workspace.id)}
            />
          ))}
        </div>
      )}
    </MCard>
  );
};

export default WorkspacesList;