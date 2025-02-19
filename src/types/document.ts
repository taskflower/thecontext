// src/types/document.ts
import { DocumentSchema } from './schema';

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

export interface DocumentsStore {
  containers: DocumentContainer[];
  documents: Document[];
  contexts: DocumentContainerContext[];
  
  addContainer: (container: AddContainerInput) => void;
  updateContainer: (id: string, updates: Partial<DocumentContainer>) => void;
  deleteContainer: (id: string) => void;
  
  addDocument: (document: AddDocumentInput) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  
  getContainerDocuments: (documentContainerId: string) => Document[];
  linkContainerToInstance: (documentContainerId: string, instanceId: string) => void;
  reset: () => void;
}