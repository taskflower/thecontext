/* eslint-disable @typescript-eslint/no-explicit-any */

// Document Types
export type CustomFieldType = 'string' | 'number' | 'boolean' | 'date';

export interface ICustomFieldSchema {
  name: string;
  type: CustomFieldType;
  required: boolean;
  defaultValue?: any;
}

export interface IDocumentSchema {
  id: string;
  name: string;
  fields: ICustomFieldSchema[];
}

export interface IContainerDocument {
  id: string;
  title: string;
  content: string;
  customFields: Record<string, any>;
  schemaId: string;
}

export interface IContainer {
  id: string;
  name: string;
  documents: IContainerDocument[];
  schemas: IDocumentSchema[];
  customFields: Record<string, any>;
}

export interface IContainerRelation {
  id: string;
  sourceContainerId: string;
  targetContainerId: string;
  sourceField: string;
  targetField: string;
  condition: 'equals' | 'greater' | 'less' | 'contains';
}

// Task Types
export interface ITask {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  containerId?: string;
  relatedDocumentIds: string[];
  steps: ITaskStep[];
}

export interface ITaskStep {
  id: string;
  taskId: string;
  order: number;
  type: 'retrieval' | 'processing' | 'generation' | 'validation' | 'custom';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  input?: string;
  output?: string;
}

export interface ITaskTemplate {
  id: string;
  name: string;
  description: string;
  defaultSteps: Omit<ITaskStep, 'id' | 'taskId' | 'status' | 'input' | 'output'>[];
  defaultPriority: ITask['priority'];
}