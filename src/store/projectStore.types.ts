// src/store/projectStore.types.ts
import { Project } from "@/types";

export interface ProjectState {
  // Data
  projects: Project[];
  
  // Basic CRUD operations
  getProjectById: (projectId: string) => Project | undefined;
  getProjectBySlug: (slug: string) => Project | undefined;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => boolean;
  deleteProject: (id: string) => boolean;
  
  // Scenario association methods
  addScenarioToProject: (projectId: string, scenarioId: string) => boolean;
  removeScenarioFromProject: (projectId: string, scenarioId: string) => boolean;
}