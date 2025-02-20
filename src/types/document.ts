// src/types/document.ts

import { DocumentSchema } from "./schema";

export type RelationType = 'OneToOne' | 'OneToMany';

export interface RelationConfig {
  id: string;
  sourceContainerId: string;
  targetContainerId: string;
  type: RelationType;
  name: string;
  description?: string;
}

export interface DocumentRelation {
  id: string;
  sourceDocumentId: string;
  sourceContainerId: string;
  targetDocumentId: string;
  targetContainerId: string;
  configId: string;
  createdAt: Date;
}

export interface DocumentContainer {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  targetDocumentCount?: number;
  schema?: DocumentSchema;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  documentContainerId: string;
  order: number;
  [key: string]: unknown;
}

export interface DocumentContainerContext {
  documentContainerId: string;
  instanceIds: string[];
}

export type AddContainerInput = Omit<DocumentContainer, 'id' | 'createdAt'>;
export type AddDocumentInput = Omit<Document, 'id' | 'createdAt' | 'updatedAt'>;
export type AddRelationConfigInput = Omit<RelationConfig, 'id'>;

export interface DocumentsStore {
  containers: DocumentContainer[];
  documents: Document[];
  contexts: DocumentContainerContext[];
  relations: DocumentRelation[];
  relationConfigs: RelationConfig[];
  
  // Container operations
  addContainer: (container: AddContainerInput) => void;
  updateContainer: (id: string, updates: Partial<DocumentContainer>) => void;
  deleteContainer: (id: string) => void;
  
  // Document operations
  addDocument: (document: AddDocumentInput) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  
  // Relation operations
  addRelationConfig: (config: AddRelationConfigInput) => void;
  removeRelationConfig: (configId: string) => void;
  addRelation: (sourceDocId: string, targetDocId: string, configId: string) => void;
  removeRelation: (relationId: string) => void;
  
  // Query operations
  getContainerDocuments: (documentContainerId: string) => Document[];
  getDocumentRelations: (documentId: string) => DocumentRelation[];
  getRelatedDocuments: (documentId: string, targetContainerId?: string) => Document[];
  getAvailableRelationConfigs: (sourceContainerId: string) => RelationConfig[];
  
  // Utility operations
  linkContainerToInstance: (documentContainerId: string, instanceId: string) => void;
  reset: () => void;
}