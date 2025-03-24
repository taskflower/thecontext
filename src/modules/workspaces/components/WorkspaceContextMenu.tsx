import React, { useRef, useEffect } from "react";
import { X, Edit } from "lucide-react";
import { useAppStore } from "../../store";

interface WorkspaceContextMenuProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string) => void;
}

const WorkspaceContextMenu: React.FC<WorkspaceContextMenuProps> = ({
  workspaceId,
  isOpen,
  onClose,
  onEdit,
}) => {
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle delete workspace
  const handleDelete = () => {
    deleteWorkspace(workspaceId);
    onClose();
  };

  // Handle edit workspace
  const handleEdit = () => {
    onEdit(workspaceId);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10"
    >
      <button
        onClick={handleEdit}
        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
      >
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </button>
      <button
        onClick={handleDelete}
        className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center"
      >
        <X className="h-4 w-4 mr-2" />
        Delete
      </button>
    </div>
  );
};

export default WorkspaceContextMenu;