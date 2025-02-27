/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/responseTypes.ts
export type ActionType = 'create_container' | 'create_document' | 'create_task' | 
  'create_template' | 'update_project' | 'custom';

export type EntityType = 'container' | 'document' | 'task' | 'template' | 'project';

export interface IResponseMapping {
  sourcePath: string;
  targetPath: string;
}

export interface IEntityMapping {
  entityType: EntityType;
  sourcePath: string;
  fieldMapping: Record<string, string>;
}

export interface IResponseAction {
  type: 'execute' | 'map_to_fields' | 'create_entities' | 'custom';
  
  // Dla map_to_fields - mapowanie do innych pól
  fieldMappings?: Record<string, string>;
  
  // Dla create_entities - tworzenie obiektów
  entityMappings?: IEntityMapping[];
  
  // Dla custom - informacje dla modułu rozszerzenia
  customHandler?: string;
  customConfig?: Record<string, any>;
}

export interface IExecutionPlan {
  projectId: string;
  actions: Array<{
    type: ActionType;
    data: Record<string, any>;
  }>;
}