import React from "react";
import { Project } from "../../types";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  project: Project;
  navigateToFolder: (folderId: string) => void;
  setActiveTab: (tab: "dashboard" | "tasks" | "documents") => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
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
    <Card className="hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{project.title}</CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <Progress value={project.progress} className="h-2 mb-4" />
      </CardContent>

      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-sm text-muted-foreground">
          Tasks: {project.completedTasks}/{project.tasks}
        </div>
        <Button variant="ghost" size="sm" className="text-primary" onClick={handleClick}>
          View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;