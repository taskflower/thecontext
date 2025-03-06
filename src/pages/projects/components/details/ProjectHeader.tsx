// src/pages/projects/components/details/ProjectHeader.tsx
import React from "react";
import { ChevronLeft, Edit3, Plus } from "lucide-react";
import { Button } from "@/components/ui";
import { useAdminNavigate } from "@/hooks";
import { Project } from "@/types";

interface ProjectHeaderProps {
  project: Project;
  onEditClick: () => void;
  onAddScenarioClick: () => void;
}

const ProjectHeader: React.FC<ProjectHeaderProps> = ({
  project,
  onEditClick,
  onAddScenarioClick,
}) => {
  const navigate = useAdminNavigate();

  return (
    <header className="bg-white border-b px-6 py-3">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/projects")}
          className="mr-4"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">{project.name}</h1>
        <div className="text-sm text-muted-foreground ml-4">
          <span>Slug: {project.slug}</span>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onEditClick}>
            <Edit3 size={16} className="mr-2" />
            Edit Project
          </Button>
          <Button onClick={onAddScenarioClick}>
            <Plus size={16} className="mr-2" />
            Add Scenario
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ProjectHeader;