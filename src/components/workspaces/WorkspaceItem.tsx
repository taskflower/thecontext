// components/workspaces/WorkspaceItem.tsx
import useStore from "@/store";
import { Workspace } from "@/store/types";
import React from "react";

interface WorkspaceItemProps {
  workspace: Workspace;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({ workspace }) => {
  const setSelectedIds = useStore((state) => state.setSelectedIds);
  const setView = useStore((state) => state.setView);
  const deleteWorkspace = useStore((state) => state.deleteWorkspace);

  const handleSelect = () => {
    setSelectedIds({ workspace: workspace.id });
    setView("scenarios");
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Usunąć ten workspace?")) {
      deleteWorkspace(workspace.id);
    }
  };

  return (
    <div
      className="rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleSelect}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-medium">{workspace.name}</h3>
        <button 
          onClick={handleDelete} 
          className="text-[hsl(var(--destructive))] hover:opacity-80"
          aria-label="Usuń workspace"
        >
          &times;
        </button>
      </div>
      <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        {workspace.scenarios.length} scenariuszy
      </div>
    </div>
  );
};

export default WorkspaceItem;