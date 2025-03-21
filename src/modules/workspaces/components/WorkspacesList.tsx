import React, { useState } from "react";
import { PlusCircle, MoreHorizontal, X, Folder, FolderOpen } from "lucide-react";
import { useAppStore } from "../../store";
import { Workspace } from "../types";
import { useDialogState } from "../../common/hooks";
import { cn } from "@/utils/utils";

const WorkspacesList: React.FC = () => {
  const workspaces = useAppStore((state) => state.items);
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const addWorkspace = useAppStore((state) => state.addWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  
  const { isOpen, formData, openDialog, handleChange, setIsOpen } = useDialogState<{
    title: string;
  }>({
    title: "",
  });
  
  const handleAddWorkspace = () => {
    if (!formData.title.trim()) return;
    addWorkspace({ title: formData.title });
    setIsOpen(false);
  };
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Workspaces</h2>
        <button
          onClick={() => openDialog()}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add workspace"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {workspaces.length > 0 ? (
          <ul className="space-y-0.5">
            {workspaces.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                isSelected={workspace.id === selectedWorkspaceId}
                onSelect={selectWorkspace}
                onDelete={deleteWorkspace}
                menuOpen={menuOpen === workspace.id}
                toggleMenu={() => toggleMenu(workspace.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No workspaces found</p>
            <p className="text-xs mt-1">Create a new workspace to get started</p>
          </div>
        )}
      </div>
      
      {/* Add Workspace Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Add Workspace</h3>
              <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter workspace title"
                  className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWorkspace}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  Add Workspace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface WorkspaceItemProps {
  workspace: Workspace;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  isSelected,
  onSelect,
  onDelete,
  menuOpen,
  toggleMenu,
}) => {
  return (
    <li
      className={cn(
        "group flex items-center justify-between px-2 py-2 rounded-md",
        isSelected 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      <button
        className="flex items-center flex-1 min-w-0 text-left"
        onClick={() => onSelect(workspace.id)}
      >
        <div className="mr-2">
          {isSelected ? (
            <FolderOpen className="h-4 w-4" />
          ) : (
            <Folder className="h-4 w-4" />
          )}
        </div>
        <span className="truncate text-sm font-medium">{workspace.title}</span>
        <span className="ml-2 text-xs text-muted-foreground">
          ({workspace.children?.length || 0})
        </span>
      </button>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen 
              ? "bg-muted text-foreground" 
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={() => onDelete(workspace.id)}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default WorkspacesList;