// src/store/projectStore.tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ProjectState } from './projectStore.types';


export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      // Data
      projects: [],
      
      // Basic CRUD operations
      getProjectById: (projectId) => {
        return get().projects.find(project => project.id === projectId);
      },
      
      getProjectBySlug: (slug) => {
        return get().projects.find(project => project.slug === slug);
      },
      
      addProject: (project) => {
        set((state) => ({ 
          projects: [...state.projects, project] 
        }));
      },
      
      updateProject: (id, updates) => {
        const projectExists = get().projects.some(p => p.id === id);
        
        if (!projectExists) {
          return false;
        }
        
        set((state) => ({
          projects: state.projects.map(project => 
            project.id === id 
              ? { ...project, ...updates, updatedAt: new Date().toISOString() } 
              : project
          )
        }));
        
        return true;
      },
      
      deleteProject: (id) => {
        const projectExists = get().projects.some(p => p.id === id);
        
        if (!projectExists) {
          return false;
        }
        
        set((state) => ({
          projects: state.projects.filter(p => p.id !== id)
        }));
        
        return true;
      },
      
      // Scenario association methods
      addScenarioToProject: (projectId, scenarioId) => {
        const project = get().getProjectById(projectId);
        
        if (!project) {
          return false;
        }
        
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              const scenarios = p.scenarios || [];
              if (scenarios.includes(scenarioId)) {
                return p;
              }
              return { 
                ...p, 
                scenarios: [...scenarios, scenarioId],
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          })
        }));
        
        return true;
      },
      
      removeScenarioFromProject: (projectId, scenarioId) => {
        const project = get().getProjectById(projectId);
        
        if (!project || !project.scenarios.includes(scenarioId)) {
          return false;
        }
        
        set((state) => ({
          projects: state.projects.map(p => {
            if (p.id === projectId) {
              return {
                ...p,
                scenarios: p.scenarios.filter(id => id !== scenarioId),
                updatedAt: new Date().toISOString()
              };
            }
            return p;
          })
        }));
        
        return true;
      }
    }),
    {
      name: 'app-projects-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects
      }),
    }
  )
);