/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/documentTypes.ts

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