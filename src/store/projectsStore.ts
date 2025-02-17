// src/store/projectsStore.ts
import { ProjectsStore } from '@/types/project';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set) => ({
      projects: [],

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, {
            ...project,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date(),
          }],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id
              ? { ...project, ...updates, updatedAt: new Date() }
              : project
          ),
        })),

      removeProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
        })),

      reset: () =>
        set(() => ({
          projects: [],
        })),
    }),
    {
      name: 'projects-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);