/* eslint-disable @typescript-eslint/no-explicit-any */
export interface DocumentContainer {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  targetDocumentCount?: number;
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
}

export interface DocumentContainerContext {
  documentContainerId: string;
  instanceIds: string[];
}

export interface DocumentsStore {
  containers: DocumentContainer[];
  documents: Document[];
  contexts: DocumentContainerContext[];
  
  // Metody dla kontenerów - bez Promise, zgodnie z implementacją
  addContainer: (container: Omit<DocumentContainer, 'id' | 'createdAt'>) => void;
  updateContainer: (id: string, updates: any) => void;
  
  // Metody dla dokumentów
  addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  
  // Metody pomocnicze
  getContainerDocuments: (documentContainerId: string) => Document[];
  linkContainerToInstance: (documentContainerId: string, instanceId: string) => void;
  deleteContainer: (id: string) => void;
  reset: () => void;
}