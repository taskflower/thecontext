import { useState } from "react";
import { PlusCircle, MoreHorizontal, Folder, FolderOpen, ExternalLink } from "lucide-react";
import { useAppStore } from "../../store";
import { cn } from "@/utils/utils";
import { AddNewWorkspace, EditWorkspace, WorkspaceContextMenu } from "..";
import { Workspace } from "../types";
import { Link } from "react-router-dom";

const WorkspacesList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);

  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [workspaceToEdit, setWorkspaceToEdit] = useState<string>("");

  const handleEditWorkspace = (id: string) => {
    setWorkspaceToEdit(id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-base font-medium">Workspaces</h2>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add workspace"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {items.length > 0 ? (
          <ul className="space-y-0.5">
            {items.map((workspace) => (
              <WorkspaceItem
                key={workspace.id}
                workspace={workspace}
                isSelected={workspace.id === selectedWorkspaceId}
                onSelect={selectWorkspace}
                menuOpen={menuOpen === workspace.id}
                setMenuOpen={setMenuOpen}
                onEdit={handleEditWorkspace}
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

      {/* Add new workspace dialog */}
      <AddNewWorkspace isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />

      {/* Edit workspace dialog */}
      <EditWorkspace
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        workspaceId={workspaceToEdit}
      />
    </div>
  );
};

interface WorkspaceItemProps {
  workspace: Workspace;
  isSelected: boolean;
  onSelect: (id: string) => void;
  menuOpen: boolean;
  setMenuOpen: (id: string | null) => void;
  onEdit: (id: string) => void;
}

const WorkspaceItem: React.FC<WorkspaceItemProps> = ({
  workspace,
  isSelected,
  onSelect,
  menuOpen,
  setMenuOpen,
  onEdit,
}) => {
  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(menuOpen ? null : workspace.id);
  };

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
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="truncate text-sm font-medium">
              {workspace.title}
            </span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({workspace.children?.length || 0} scenarios)
            </span>
          </div>
          {workspace.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {workspace.description}
            </p>
          )}
          {workspace.slug && (
            <div className="flex items-center mt-0.5">
              <p className="text-xs text-muted-foreground truncate">
                <span className="opacity-70">slug:</span> {workspace.slug}
              </p>
              {/* External link to slug URL */}
              <Link 
                to={`/${workspace.slug}`}
                className="ml-1 text-xs text-primary hover:text-primary/80 flex items-center"
                onClick={(e) => e.stopPropagation()}
                title={`Open ${workspace.slug} page`}
              >
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </button>

      <div className="relative">
        <button
          onClick={toggleMenu}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen
              ? "bg-muted text-foreground"
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>

        <WorkspaceContextMenu
          workspaceId={workspace.id}
          isOpen={menuOpen}
          onClose={() => setMenuOpen(null)}
          onEdit={onEdit}
        />
      </div>
    </li>
  );
};

export default WorkspacesList;