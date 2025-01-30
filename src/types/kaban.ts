import { BaseEntity } from "./common";
import { Step } from "./template";

// src/types/kanban.ts
export type KanbanStatus = 'todo' | 'inProgress' | 'done';

export interface KanbanTaskTemplate {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  templateId: string;
  steps: Step[];  // Zachowujemy steps bo są używane w ProcessRunner
}

export interface KanbanBoard extends BaseEntity {
  name: string;
  description: string;
  tasks: KanbanTaskTemplate[];
}

export interface KanbanTask {
  id: string;
  templateTaskId: string;
  status: KanbanStatus;
  completedAt: Date | null;
}

export interface KanbanInstance extends BaseEntity {
  templateId: string;
  name: string;
  tasks: KanbanTask[];
}