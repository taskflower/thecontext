// src/pages/projects/components/ProjectsView.tsx
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Project } from "@/types";
import { Card } from "@/components/ui";
import projectService from "../services/ProjectService";
import { EditProjectModal, NewProjectModal, ProjectCard, ProjectListItem, ProjectsHeader } from "..";

interface ProjectsViewProps {
  viewMode: "cards" | "list";
  setViewMode: (mode: "cards" | "list") => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({ viewMode, setViewMode }) => {
  // State for projects
  const [projects, setProjects] = useState<Project[]>([]);
  
  // State for modals
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = () => {
      const projectsData = projectService.getAllProjects();
      setProjects(projectsData);
    };
    
    fetchProjects();
    
    // We need to set up a periodic refresh or subscription mechanism
    const interval = setInterval(fetchProjects, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  const toggleNewProjectModal = () => {
    setShowNewProjectModal(!showNewProjectModal);
  };

  const toggleEditProjectModal = (project: Project | null) => {
    setEditProject(project);
    setShowEditModal(!!project);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      <ProjectsHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        toggleNewProjectModal={toggleNewProjectModal}
      />

      <div className="p-4 flex-1 overflow-auto">
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
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
              <div className="col-span-3">Slug</div>
              <div className="col-span-2">Scenarios</div>
              <div className="col-span-2">Created</div>
              <div className="col-span-1"></div>
            </div>

            {projects.map((project) => (
              <ProjectListItem
                key={project.id}
                project={project}
                toggleEditProjectModal={toggleEditProjectModal}
              />
            ))}
          </Card>
        )}
      </div>

      {/* Rendering modals */}
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