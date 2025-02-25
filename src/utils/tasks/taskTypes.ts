/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/taskTypes.ts

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type StepType = 'retrieval' | 'processing' | 'generation' | 'validation' | 'custom';

export interface ITaskStep {
  id: string;
  taskId: string;
  order: number;
  type: StepType;
  status: TaskStatus;
  description: string;
  input?: string;
  output?: string;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: Date;
  updatedAt: Date;
  containerId?: string;
  relatedDocumentIds: string[];
  steps: ITaskStep[];
}

export interface ITaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultSteps: Omit<ITaskStep, 'id' | 'taskId' | 'status' | 'input' | 'output'>[];
  defaultPriority: TaskPriority;
}