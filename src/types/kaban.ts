// src/types/kaban.ts
import {Step } from "./template";

export type KanbanStatus = 'todo' | 'inProgress' | 'done';

export interface KanbanTaskTemplate {
  id: string;
  name: string;
  description?: string;
  dependencies: string[];
  templateId: string;
  steps: Step[]; // Dodajemy obowiązkowe steps
}

export type KanbanBoardTemplate = {
  id: string;
  name: string;
  description: string;
  tasks: KanbanTaskTemplate[];
};

export type KanbanInstance = {
  id: string;
  templateId: string;
  name: string;
  tasks: KanbanInstanceTask[];
  createdAt: Date;
};

export type KanbanInstanceTask = {
  id: string;
  templateTaskId: string;
  status: KanbanStatus;
  completedAt?: Date;
};

export interface KanbanStore {
  boardTemplates: KanbanBoardTemplate[];
  instances: KanbanInstance[];
  
  addBoardTemplate: (template: Omit<KanbanBoardTemplate, 'id'>) => void;
  updateBoardTemplate: (template: KanbanBoardTemplate) => void;
  removeBoardTemplate: (id: string) => void;
  createInstance: (templateId: string, name: string) => void;
  updateInstanceTaskStatus: (instanceId: string, taskId: string, status: KanbanStatus) => void;
  removeInstance: (id: string) => void;
}