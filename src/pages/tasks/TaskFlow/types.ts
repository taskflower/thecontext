export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'completed';
export type ViewMode = 'cards' | 'list';
export type TabName = 'dashboard' | 'tasks' | 'documents';

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface File {
  id: string;
  name: string;
  folderId: string | null;
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