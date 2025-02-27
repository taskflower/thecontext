/* eslint-disable @typescript-eslint/no-explicit-any */

import { IResponseAction } from "./response/responseTypes";

// src/types/taskTypes.ts
export type StepType = 'retrieval' | 'processing' | 'generation' | 'validation' | 'custom' |
  'form' | 'llm_prompt' | 'llm_response';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'failed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface IFormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  label: string;
  options?: string[];
  required?: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
}

export interface IFormConfig {
  fields: IFormField[];
  submitLabel?: string;
  onSubmitAction?: 'next_step' | 'complete_task' | 'custom';
}

export interface IPromptConfig {
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat?: 'text' | 'json' | 'markdown';
  variables?: string[];
}

export interface ITaskStep {
  id: string;
  taskId: string;
  order: number;
  type: StepType;
  status: TaskStatus;
  description: string;
  input?: string;
  output?: string;
  
  // Konfiguracje specyficzne dla typów
  formConfig?: IFormConfig;
  promptConfig?: IPromptConfig;
  
  // Akcje związane z odpowiedzią
  responseActions?: IResponseAction;
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