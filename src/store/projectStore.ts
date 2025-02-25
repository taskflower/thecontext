/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/projectStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { generateId } from "@/utils/utils";

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
  
  // Query methods
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProject: null,
      
      // Project operations
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
      
      removeProject: (id) => 
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject
        })),
      
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
      
      // Query methods
      getProjectById: (id) => get().projects.find(p => p.id === id),
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