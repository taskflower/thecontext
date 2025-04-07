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
      className="list-item"
      onClick={handleSelect}
    >
      <span className="font-medium">{workspace.name}</span>
      <button 
        onClick={handleDelete} 
        className="text-destructive hover:text-destructive/80"
        aria-label="Usuń workspace"
      >
        ×
      </button>
    </div>
  );
};

export default WorkspaceItem;