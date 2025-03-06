// src/pages/projects/components/details/ProjectDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { useAdminNavigate } from "@/hooks";
import projectService from "../../services/ProjectService";
import ProjectHeader from "./ProjectHeader";
import ProjectScenariosPanel from "./ProjectScenariosPanel";
import AddScenarioModal from "./AddScenarioModal";
import { EditProjectModal } from "../..";

const ProjectDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useAdminNavigate();
  
  // States for modals and data
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddScenarioModal, setShowAddScenarioModal] = useState(false);
  const [project, setProject] = useState(projectService.getProjectBySlug(slug || ""));

  // Refresh project data
  useEffect(() => {
    const refreshProject = () => {
      if (slug) {
        setProject(projectService.getProjectBySlug(slug));
      }
    };
    
    refreshProject();
    
    // Set up a refresh interval
    const interval = setInterval(refreshProject, 2000);
    
    return () => {
      clearInterval(interval);
    };
  }, [slug]);

  // Handle project not found
  useEffect(() => {
    if (!project && slug) {
      navigate("/projects");
    }
  }, [project, slug, navigate]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The project you are looking for does not exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/projects")}>
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Component */}
      <ProjectHeader
        project={project}
        onEditClick={() => setShowEditModal(true)}
        onAddScenarioClick={() => setShowAddScenarioModal(true)}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {/* Project Description Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            {project.description ? (
              <p>{project.description}</p>
            ) : (
              <p className="text-muted-foreground">No description provided</p>
            )}
          </div>

          {/* Scenarios Panel */}
          <ProjectScenariosPanel projectId={project.id} />
        </div>
      </main>

      {/* Modals */}
      {showEditModal && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showAddScenarioModal && (
        <AddScenarioModal
          projectId={project.id}
          isOpen={showAddScenarioModal}
          onClose={() => setShowAddScenarioModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage;