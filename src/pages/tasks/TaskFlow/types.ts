/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/types.ts

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'completed';
export type ViewMode = 'cards' | 'list';
export type TabName = 'dashboard' | 'tasks' | 'documents';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

// Updated Document interface (replacing File)
export interface Document {
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
  status: Status;
  priority: Priority;
  dueDate: string;
  projectId: string;
}