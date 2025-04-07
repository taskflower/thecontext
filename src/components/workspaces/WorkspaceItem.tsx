// components/workspaces/WorkspaceItem.tsx
import React from "react";
import useStore from "../../store";
import { Workspace } from "../../store";

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
      className="flex justify-between items-center p-2 bg-white rounded shadow cursor-pointer hover:bg-gray-50"
      onClick={handleSelect}
    >
      <span>{workspace.name}</span>
      <button onClick={handleDelete} className="text-red-500">
        ×
      </button>
    </div>
  );
};

export default WorkspaceItem;
