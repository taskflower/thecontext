/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/types.ts
// Update the Step interface with conversationData field
export type StepType = 'form' | 'document' | 'data' | 'custom' | 'ai-content' | 'checklist' | 'decision';
export type StepStatus = 'pending' | 'in-progress' | 'completed' | 'skipped' | 'failed';
// Define the conversation item type
export interface ConversationItem {
  role: "assistant" | "user";
  content: string;
}
export interface Step {
  id: string;
  taskId: string;
  title: string;
  description: string;
  type: StepType;
  status: StepStatus;
  order: number;
  config: Record<string, any>;
  options: Record<string, any>;
  result: Record<string, any> | null;
  conversationData?: ConversationItem[]; // Add conversationData field
}
// Remaining type definitions
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'review' | 'completed';
export type ViewMode = 'cards' | 'list';
export type TabName = 'dashboard' | 'tasks' | 'documents';
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  isProjectRoot?: boolean;    // Flag for the root folder that contains all project folders
  isProjectFolder?: boolean;  // Flag for folders that represent individual projects
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
  description: string;
  status: Status;
  priority: Priority;
  dueDate: string;
  projectId: string;
  currentStepId?: string | null;
  data?: Record<string, any>;
}