import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ProjectsHeader from "./ProjectsHeader";
import { Card } from "@/components/ui/card";
import ProjectCard from "./ProjectCard";
import ProjectListItem from "./ProjectListItem";
import { useDataStore, useUIStore } from "@/store";
import NewProjectModal from "./NewProjectModal";
import EditProjectModal from "./EditProjectModal";
import { Project } from "@/types";

const ProjectsView: React.FC = () => {
  const { projects } = useDataStore();
  const { 
    viewMode, 
    setActiveTab, 
    toggleNewProjectModal,
    setViewMode,
    showNewProjectModal
  } = useUIStore();

  const navigate = useNavigate();
  const { lang } = useParams();

  // State for edit project modal
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const toggleEditProjectModal = (project: Project | null) => {
    setEditProject(project);
    setShowEditModal(!!project);
  };

  // Router-based navigation to folder
  const navigateToFolder = (folderId: string) => {
    navigate(`/admin/${lang}/documents/${folderId}`);
    setActiveTab("documents");
  };

  return (
    <div className="flex-1 flex flex-col">
      <ProjectsHeader 
        viewMode={viewMode} 
        setViewMode={setViewMode}
        toggleNewProjectModal={toggleNewProjectModal}
      />
      
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
                toggleEditProjectModal={toggleEditProjectModal}
              />
            ))}

            <Card
              className="border border-dashed cursor-pointer hover:bg-secondary/20 transition-colors"
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
                toggleEditProjectModal={toggleEditProjectModal}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Render the modals conditionally */}
      {showNewProjectModal && (
        <NewProjectModal toggleNewProjectModal={toggleNewProjectModal} />
      )}
      
      <EditProjectModal 
        project={editProject}
        isOpen={showEditModal}
        onClose={() => toggleEditProjectModal(null)}
      />
    </div>
  );
};

export default ProjectsView;