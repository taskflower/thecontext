/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/types.ts
// Add these new types for steps implementation

export type StepType = 'form' | 'document' | 'data' | 'custom';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped';

export interface Step {
  id: string;
  taskId: string;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  order: number;
  config: Record<string, any>;
  options: Record<string, any>; // Added options property
  result: Record<string, any> | null;
}

// Extend existing types.ts file
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'completed';
export type ViewMode = 'cards' | 'list';
export type TabName = 'dashboard' | 'tasks' | 'documents';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface DocItem {
  id: string;
  title: string;
  content: string;
  metaKeys: string[];
  schema: Record<string, any>;
  folderId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  tasks: number;
  completedTasks: number;
  dueDate: string;
  folderId: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string; // Added description property
  status: Status;
  priority: Priority;
  dueDate: string;
  projectId: string;
  currentStepId?: string | null;
  data?: Record<string, any>;
}