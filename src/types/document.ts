import { DocumentRelation, RelationConfig } from "./relation";
import { DocumentSchema } from "./schema";
// src/types/document.ts

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}


export interface DocumentContainer {
  id: string;
  name: string;
  description?: string;
  schema?: DocumentSchema;
  createdAt: Date;
  targetDocumentCount?: number;
  messagesScope: Message[];
}

export interface Document {
  id: string;
  title: string;
  content: string;
  documentContainerId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: CustomFieldValue;
}

export type CustomFieldValue = string | number | boolean | Date | null;

export interface AddContainerInput {
  name: string;
  description?: string;
  schema?: DocumentSchema; // zamiast schemaId używamy bezpośrednio obiektu schematu
  targetDocumentCount?: number;
}

export interface AddDocumentInput {
  title: string;
  content?: string;
  documentContainerId: string;
  order?: number;
  [key: string]: CustomFieldValue | undefined;
}

export interface DocumentContext {
  documentContainerId: string;
  instanceIds: string[];
}

export interface DocumentsStore {
  // Stan
  containers: DocumentContainer[];
  documents: Document[];
  contexts: DocumentContext[];
  relations: DocumentRelation[];
  relationConfigs: RelationConfig[];

  // Operacje na kontenerach
  addContainer: (container: AddContainerInput) => void;
  updateContainer: (id: string, updates: Partial<DocumentContainer>) => void;
  deleteContainer: (id: string) => void;

  // Operacje na dokumentach
  addDocument: (document: AddDocumentInput) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;

  // Operacje na relacjach
  addRelationConfig: (config: Omit<RelationConfig, "id">) => void;
  removeRelationConfig: (configId: string) => void;
  addRelation: (sourceDocId: string, targetDocId: string, configId: string) => void;
  removeRelation: (relationId: string) => void;

  // Operacje na kontekstach
  linkContainerToInstance: (documentContainerId: string, instanceId: string) => void;

  // Metody pomocnicze
  getContainerDocuments: (documentContainerId: string) => Document[];
  getDocumentRelations: (documentId: string) => DocumentRelation[];
  getRelatedDocuments: (documentId: string, targetContainerId?: string) => Document[];
  getAvailableRelationConfigs: (sourceContainerId: string) => RelationConfig[];

  // Reset stanu
  reset: () => void;
}