/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/project.ts
import { BaseEntity } from "./common";

export interface Project extends BaseEntity {
  title: string;
  description: string;
  settings: Record<string, any>;
}

export interface ProjectsStore {
  projects: Project[];
  
  // Actions
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  reset: () => void;
}