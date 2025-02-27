import React from "react";
import { Project } from "../../types";
import { Progress } from "@/components/ui/progress";

interface ProjectListItemProps {
  project: Project;
  navigateToFolder: (folderId: string) => void;
  setActiveTab: (tab: "dashboard" | "tasks" | "documents") => void;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ 
  project, 
  navigateToFolder, 
  setActiveTab 
}) => {
  const handleClick = () => {
    if (project.folderId) {
      navigateToFolder(project.folderId);
      setActiveTab("documents");
    }
  };
  
  return (
    <div 
      className="grid grid-cols-12 p-3 border-b hover:bg-secondary/20 cursor-pointer"
      onClick={handleClick}
    >
      <div className="col-span-4 font-medium">{project.title}</div>
      <div className="col-span-3">
        <Progress value={project.progress} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">{project.progress}%</div>
      </div>
      <div className="col-span-2 text-muted-foreground">{project.completedTasks}/{project.tasks}</div>
      <div className="col-span-2 text-muted-foreground">{project.dueDate}</div>
      <div className="col-span-1"></div>
    </div>
  );
};

export default ProjectListItem;