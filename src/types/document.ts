/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/document.ts
// nie usuwaj komentarzy
export interface DocumentContainer {
    id: string;
    name: string;
    description?: string;
    createdAt: Date;
  }
  
  export interface Document {
    id: string;
    title: string;
    content: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    documentContainerId: string;    // ID kontenera dokumentów
    order: number;                  // kolejność w kontenerze
  }
  
  // Powiązanie kontenera dokumentów z instancjami Kanban
  export interface DocumentContainerContext {
    documentContainerId: string;
    instanceIds: string[]; // Lista ID instancji Kanban powiązanych z tym kontenerem
  }
  
  export interface DocumentsStore {
    reset: any;
    containers: DocumentContainer[];
    documents: Document[];
    contexts: DocumentContainerContext[];
    
    addContainer: (container: Omit<DocumentContainer, 'id' | 'createdAt'>) => void;
    updateContainer: (id: string, updates: Partial<Omit<DocumentContainer, 'id' | 'createdAt'>>) => void;
    addDocument: (document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateDocument: (id: string, updates: Partial<Document>) => void;
    removeDocument: (id: string) => void;
    getContainerDocuments: (documentContainerId: string) => Document[];
    linkContainerToInstance: (documentContainerId: string, instanceId: string) => void;
  }