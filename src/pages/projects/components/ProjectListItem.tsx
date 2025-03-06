// src/pages/projects/components/ProjectListItem.tsx
import { MoreHorizontal, Pencil, Trash2, Layers } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Project } from "@/types";
import { Button } from "@/components/ui";
import projectService from "../services/ProjectService";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/useToast";

interface ProjectListItemProps {
  project: Project;
  toggleEditProjectModal: (project: Project) => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({
  project,
  toggleEditProjectModal,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { lang } = useParams();

  const navigateToProject = () => {
    navigate(`/admin/${lang}/projects/${project.slug}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleEditProjectModal(project);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      const result = projectService.deleteProject(project.id);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete project",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success", 
          description: "Project deleted successfully",
          variant: "default"
        });
      }
    }
  };

  return (
    <div className="grid grid-cols-12 p-3 border-b hover:bg-secondary/20 cursor-pointer" onClick={navigateToProject}>
      <div className="col-span-4 font-medium">{project.name}</div>
      <div className="col-span-3 text-muted-foreground overflow-hidden text-ellipsis">
        {project.slug}
      </div>
      <div className="col-span-2 flex items-center text-muted-foreground">
        <Layers size={16} className="mr-2" />
        {project.scenarios.length} {project.scenarios.length === 1 ? "scenario" : "scenarios"}
      </div>
      <div className="col-span-2 text-muted-foreground">
        {new Date(project.createdAt).toLocaleDateString()}
      </div>
      <div className="col-span-1 flex items-center justify-end">
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