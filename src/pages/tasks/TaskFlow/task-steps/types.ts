/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/task-steps/types.ts
export type StepType = 
  | 'form'
  | 'createDocument'
  | 'getDocument'
  | 'llmProcess'
  | 'apiProcess';

export interface StepSchema {
  id: string;
  type: StepType;
  title: string;
  description?: string;
  config: Record<string, any>;
  inputMapping?: Record<string, string>;
  outputMapping?: Record<string, string>;
}

export interface TaskStep {
  id: string;
  taskId: string;
  schema: StepSchema;
  status: 'pending' | 'running' | 'completed' | 'error';
  order: number;
  input?: Record<string, any>;
  output?: Record<string, any>;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: 'draft' | 'active' | 'completed' | 'error';
  scope: Record<string, any>;
  currentStepIndex: number;
  createdAt: string;
  updatedAt: string;
}