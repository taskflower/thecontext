/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/projectStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@/utils/utils";
import { useDocumentStore } from "./documentStore";
import { useTaskStore } from "./taskStore";
import { ITaskTemplate } from "@/utils/tasks/taskTypes";


export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  containers: string[]; // Container IDs
  templates: string[]; // Template names/IDs
  setupCompleted?: boolean;
  customFields?: Record<string, any>;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  
  // Project operations
  addProject: (project: Omit<Project, "updatedAt">) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  setCurrentProject: (id: string | null) => void;
  
  // Integration with other stores
  createProjectWithResources: (
    name: string, 
    description: string, 
    containerNames?: string[], 
    templateIds?: string[]
  ) => string;
  duplicateProject: (id: string, newName?: string) => string | null;
  
  // Utility functions
  addContainerToProject: (projectId: string, containerName: string) => string | null;
  addTemplateToProject: (projectId: string, template: Omit<ITaskTemplate, "id">) => string | null;
  addExistingContainerToProject: (projectId: string, containerId: string) => boolean;
  addExistingTemplateToProject: (projectId: string, templateId: string) => boolean;
  
  // Query methods
  getProjectById: (id: string) => Project | undefined;
  getProjectContainers: (id: string) => any[];
  getProjectTemplates: (id: string) => any[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      
      // Basic project operations
      addProject: (project) => {
        const id = project.id || generateId();
        const now = new Date();
        
        set((state) => ({
          projects: [
            ...state.projects,
            {
              ...project,
              id,
              createdAt: project.createdAt || now,
              updatedAt: now,
              containers: project.containers || [],
              templates: project.templates || [],
            }
          ],
          currentProject: {
            ...project,
            id,
            createdAt: project.createdAt || now,
            updatedAt: now,
            containers: project.containers || [],
            templates: project.templates || [],
          }
        }));
        
        return id;
      },
      
      updateProject: (id, updates) => {
        set((state) => {
          const updatedProjects = state.projects.map((project) => 
            project.id === id 
              ? { 
                  ...project, 
                  ...updates, 
                  updatedAt: new Date() 
                } 
              : project
          );
          
          const updatedProject = updatedProjects.find(p => p.id === id);
          
          return {
            projects: updatedProjects,
            currentProject: state.currentProject?.id === id && updatedProject 
              ? updatedProject 
              : state.currentProject
          };
        });
      },
      
      removeProject: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return;
        
        // Optional: Clean up related resources (containers, tasks)
        // This depends on your application's requirements
        /* 
        const { removeContainer } = useDocumentStore.getState();
        // Remove project containers 
        project.containers.forEach(containerId => {
          removeContainer(containerId);
        });
        */
        
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        }));
      },
      
      setCurrentProject: (id) => {
        if (!id) {
          set({ currentProject: null });
          return;
        }
        
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({ currentProject: project });
        }
      },
      
      // Enhanced operations with integration
      createProjectWithResources: (name, description, containerNames = [], templateIds = []) => {
        const { addContainer } = useDocumentStore.getState();
        const { templates } = useTaskStore.getState();
        
        // Create project
        const projectId = get().addProject({
          id: generateId(),
          name,
          description,
          createdAt: new Date(),
          containers: [],
          templates: [],
        });
        
        // Create containers
        const containerIds: string[] = [];
        containerNames.forEach(containerName => {
          const containerId = addContainer(containerName);
          containerIds.push(containerId);
        });
        
        // Validate and filter template IDs
        const validTemplateIds = templateIds.filter(id => 
          templates.some(t => t.id === id)
        );
        
        // Update project with resources
        get().updateProject(projectId, {
          containers: containerIds,
          templates: validTemplateIds,
        });
        
        return projectId;
      },
      
      duplicateProject: (id, newName) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return null;
        
        const { containers } = useDocumentStore.getState();
        
        // Duplicate containers if needed
        const newContainerIds: string[] = [];
        project.containers.forEach(containerId => {
          const container = containers.find(c => c.id === containerId);
          if (container) {
            const { addContainer } = useDocumentStore.getState();
            const newContainerId = addContainer(`${container.name} (Copy)`);
            newContainerIds.push(newContainerId);
          }
        });
        
        // Create duplicate project
        return get().addProject({
          name: newName || `${project.name} (Copy)`,
          description: project.description,
          createdAt: new Date(),
          containers: newContainerIds,
          templates: [...project.templates],
          customFields: project.customFields ? { ...project.customFields } : undefined,
        });
      },
      
      // Utility functions
      addContainerToProject: (projectId, containerName) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return null;
        
        const { addContainer } = useDocumentStore.getState();
        const containerId = addContainer(containerName);
        
        get().updateProject(projectId, {
          containers: [...project.containers, containerId]
        });
        
        return containerId;
      },
      
      addTemplateToProject: (projectId, template) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return null;
        
        const { addTemplate } = useTaskStore.getState();
        const templateId = addTemplate(template);
        
        get().updateProject(projectId, {
          templates: [...project.templates, templateId]
        });
        
        return templateId;
      },
      
      addExistingContainerToProject: (projectId, containerId) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return false;
        
        // Check if container exists
        const { containers } = useDocumentStore.getState();
        const containerExists = containers.some(c => c.id === containerId);
        if (!containerExists) return false;
        
        // Check if already in project
        if (project.containers.includes(containerId)) return true;
        
        get().updateProject(projectId, {
          containers: [...project.containers, containerId]
        });
        
        return true;
      },
      
      addExistingTemplateToProject: (projectId, templateId) => {
        const project = get().projects.find(p => p.id === projectId);
        if (!project) return false;
        
        // Check if template exists
        const { templates } = useTaskStore.getState();
        const templateExists = templates.some(t => t.id === templateId);
        if (!templateExists) return false;
        
        // Check if already in project
        if (project.templates.includes(templateId)) return true;
        
        get().updateProject(projectId, {
          templates: [...project.templates, templateId]
        });
        
        return true;
      },
      
      // Query methods
      getProjectById: (id) => get().projects.find(p => p.id === id),
      
      getProjectContainers: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return [];
        
        const { containers } = useDocumentStore.getState();
        return containers.filter(container => 
          project.containers.includes(container.id)
        );
      },
      
      getProjectTemplates: (id) => {
        const project = get().projects.find(p => p.id === id);
        if (!project) return [];
        
        const { templates } = useTaskStore.getState();
        return templates.filter(template => 
          project.templates.includes(template.id)
        );
      }
    }),
    {
      name: "project-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        projects: state.projects,
        currentProject: state.currentProject
      })
    }
  )
);