import React from "react";
import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Project } from "@/types";
import { useDataStore } from "@/store";

interface ProjectListItemProps {
  project: Project;
  navigateToFolder: (folderId: string) => void;
  setActiveTab: (tab: "dashboard" | "tasks" | "documents") => void;
  toggleEditProjectModal: (project: Project) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ 
  project, 
  navigateToFolder, 
  toggleEditProjectModal
}) => {
  const { deleteProject, folders } = useDataStore();

  const handleViewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (project.folderId) {
      navigateToFolder(project.folderId);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleEditProjectModal(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${project.title}"?`)) {
      deleteProject(project.id);
    }
  };

  // Check if folder exists
  const folderExists = folders.some(f => f.id === project.folderId);
  
  return (
    <div className="grid grid-cols-12 p-3 border-b hover:bg-secondary/20 cursor-pointer">
      <div className="col-span-4 font-medium">{project.title}</div>
      <div className="col-span-3">
        <Progress value={project.progress} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">{project.progress}%</div>
      </div>
      <div className="col-span-2 text-muted-foreground">{project.completedTasks}/{project.tasks}</div>
      <div className="col-span-2 text-muted-foreground">{project.dueDate}</div>
      <div className="col-span-1 flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={handleViewFolder}
          disabled={!folderExists}
          title="View project folder"
          type="button"
        >
          <FolderOpen size={16} />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ProjectListItem;