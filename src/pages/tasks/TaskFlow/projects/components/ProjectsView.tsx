import React from "react";
import { Plus } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useTaskFlowStore } from "../../store";
import ProjectCard from "./ProjectCard";
import ProjectListItem from "./ProjectListItem";

const ProjectsView: React.FC = () => {
  const { 
    viewMode, 
    projects, 
    toggleNewProjectModal, 
    navigateToFolder, 
    setActiveTab 
  } = useTaskFlowStore();
  
  return (
    <div className="p-6 flex-1 overflow-auto">
      <h3 className="text-lg font-medium mb-4">Your Projects</h3>
      
      {viewMode === "cards" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              navigateToFolder={navigateToFolder}
              setActiveTab={setActiveTab}
            />
          ))}
          
          <Card 
            className="border border-dashed cursor-pointer hover:bg-secondary/20"
            onClick={toggleNewProjectModal}
          >
            <div className="p-6 flex flex-col items-center justify-center text-muted-foreground">
              <Plus size={24} />
              <span className="mt-2">Add New Project</span>
            </div>
          </Card>
        </div>
      ) : (
        <Card>
          <div className="grid grid-cols-12 p-3 font-medium text-sm text-muted-foreground border-b">
            <div className="col-span-4">Name</div>
            <div className="col-span-3">Progress</div>
            <div className="col-span-2">Tasks</div>
            <div className="col-span-2">Due Date</div>
            <div className="col-span-1"></div>
          </div>
          
          {projects.map((project) => (
            <ProjectListItem 
              key={project.id} 
              project={project} 
              navigateToFolder={navigateToFolder}
              setActiveTab={setActiveTab}
            />
          ))}
        </Card>
      )}
    </div>
  );
};

export default ProjectsView;