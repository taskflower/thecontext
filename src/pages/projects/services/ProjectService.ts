// src/pages/projects/services/ProjectService.ts
import {  useProjectStore, useScenarioStore } from "@/store";
import { Project, Scenario } from "@/types";

// Type for service results
type ServiceResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
};

// Type for project with scenarios
export type ProjectWithScenarios = Project & {
  scenarioDetails: Scenario[];
};

class ProjectService {
  // Get project by ID
  getProjectById(id: string): Project | undefined {
    const { projects } = useProjectStore.getState();
    return projects.find(project => project.id === id);
  }

  // Get project by slug
  getProjectBySlug(slug: string): Project | undefined {
    const { projects } = useProjectStore.getState();
    return projects.find(project => project.slug === slug);
  }

  // Get all projects
  getAllProjects(): Project[] {
    const { projects } = useProjectStore.getState();
    return projects;
  }

  // Get project with associated scenarios details
  getProjectWithScenarios(id: string): ProjectWithScenarios | undefined {
    const project = this.getProjectById(id);
    if (!project) return undefined;

    const { scenarios } = useScenarioStore.getState();
    const scenarioDetails = scenarios.filter(s => project.scenarios.includes(s.id));

    return {
      ...project,
      scenarioDetails
    };
  }

  // Get all projects with scenario details
  getAllProjectsWithScenarios(): ProjectWithScenarios[] {
    const { projects } = useProjectStore.getState();
    const { scenarios } = useScenarioStore.getState();

    return projects.map(project => {
      const scenarioDetails = scenarios.filter(s => project.scenarios.includes(s.id));
      return {
        ...project,
        scenarioDetails
      };
    });
  }

  // Create new project
  createProject(name: string, slug: string, description?: string): ServiceResult<Project> {
    if (!name.trim()) {
      return { success: false, error: "Project name is required" };
    }

    if (!slug.trim()) {
      return { success: false, error: "Project slug is required" };
    }

    try {
      const { projects, addProject } = useProjectStore.getState();
      
      // Check if slug already exists
      const slugExists = projects.some(p => p.slug === slug);
      if (slugExists) {
        return { success: false, error: "A project with this slug already exists" };
      }
      
      // Create unique ID for project
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const newProject: Project = {
        id,
        name,
        slug,
        description: description || "",
        scenarios: [],
        createdAt: now,
        updatedAt: now
      };
      
      addProject(newProject);
      return { success: true, data: newProject };
    } catch (err) {
      console.error("Error creating project:", err);
      return { success: false, error: "Failed to create project" };
    }
  }

  // Update project
  updateProject(id: string, updates: Partial<Project>): ServiceResult<Project> {
    try {
      const { updateProject, projects } = useProjectStore.getState();
      const currentProject = this.getProjectById(id);
      
      if (!currentProject) {
        return { success: false, error: "Project not found" };
      }
      
      // If slug is being updated, check if it already exists
      if (updates.slug && updates.slug !== currentProject.slug) {
        const slugExists = projects.some(p => p.id !== id && p.slug === updates.slug);
        if (slugExists) {
          return { success: false, error: "A project with this slug already exists" };
        }
      }
      
      const result = updateProject(id, updates);
      
      if (!result) {
        return { success: false, error: "Failed to update project" };
      }
      
      const updatedProject = this.getProjectById(id);
      return { success: true, data: updatedProject };
    } catch (err) {
      console.error("Error updating project:", err);
      return { success: false, error: "Failed to update project" };
    }
  }

  // Delete project
  deleteProject(id: string): ServiceResult {
    try {
      const { deleteProject } = useProjectStore.getState();
      const project = this.getProjectById(id);
      
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      
      const result = deleteProject(id);
      
      if (!result) {
        return { success: false, error: "Failed to delete project" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error deleting project:", err);
      return { success: false, error: "Failed to delete project" };
    }
  }

  // Add scenario to project
  addScenarioToProject(projectId: string, scenarioId: string): ServiceResult {
    try {
      const { addScenarioToProject } = useProjectStore.getState();
      const { scenarios } = useScenarioStore.getState();
      
      const project = this.getProjectById(projectId);
      const scenarioExists = scenarios.some(s => s.id === scenarioId);
      
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      
      if (!scenarioExists) {
        return { success: false, error: "Scenario not found" };
      }
      
      // Check if scenario is already added to project
      if (project.scenarios.includes(scenarioId)) {
        return { success: false, error: "Scenario is already added to this project" };
      }
      
      const result = addScenarioToProject(projectId, scenarioId);
      
      if (!result) {
        return { success: false, error: "Failed to add scenario to project" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error adding scenario to project:", err);
      return { success: false, error: "Failed to add scenario to project" };
    }
  }

  // Remove scenario from project
  removeScenarioFromProject(projectId: string, scenarioId: string): ServiceResult {
    try {
      const { removeScenarioFromProject } = useProjectStore.getState();
      
      const project = this.getProjectById(projectId);
      
      if (!project) {
        return { success: false, error: "Project not found" };
      }
      
      if (!project.scenarios.includes(scenarioId)) {
        return { success: false, error: "Scenario is not part of this project" };
      }
      
      const result = removeScenarioFromProject(projectId, scenarioId);
      
      if (!result) {
        return { success: false, error: "Failed to remove scenario from project" };
      }
      
      return { success: true };
    } catch (err) {
      console.error("Error removing scenario from project:", err);
      return { success: false, error: "Failed to remove scenario from project" };
    }
  }
}

// Create and export a singleton instance
const projectService = new ProjectService();
export default projectService;