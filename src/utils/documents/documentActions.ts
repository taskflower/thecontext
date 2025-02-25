// src/utils/documents/documentActions.ts
import { IContainerDocument } from "./documentTypes";
import { SetState, GetState } from "./documentsInterfaces";
import { generateId } from "../utils";

export interface DocumentActions {
  addDocument: (containerId: string, document: Omit<IContainerDocument, "id">) => string;
  updateDocument: (containerId: string, documentId: string, updates: Partial<IContainerDocument>) => void;
  removeDocument: (containerId: string, documentId: string) => void;
  getContainersByProjectId: (projectId: string) => IContainerDocument[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const documentActions = (set: SetState, get: GetState): DocumentActions => ({
  addDocument: (containerId: string, document: Omit<IContainerDocument, "id">) => {
    const documentId = generateId();
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              documents: [
                ...container.documents,
                {
                  id: documentId,
                  title: document.title,
                  content: document.content,
                  customFields: document.customFields || {},
                  schemaId: document.schemaId
                }
              ]
            }
          : container
      )
    }));
    return documentId;
  },
  
  updateDocument: (containerId: string, documentId: string, updates: Partial<IContainerDocument>) => 
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              documents: container.documents.map((doc) => 
                doc.id === documentId ? { ...doc, ...updates } : doc
              )
            }
          : container
      )
    })),
  
  removeDocument: (containerId: string, documentId: string) => 
    set((state) => ({
      ...state,
      containers: state.containers.map((container) => 
        container.id === containerId
          ? {
              ...container,
              documents: container.documents.filter((doc) => doc.id !== documentId)
            }
          : container
      )
    })),

  // Metoda do pobrania dokumentów na podstawie ID projektu
  getContainersByProjectId: (projectId: string) => {
    // Ta metoda będzie używana przez ProjectStore do pobrania dokumentów projektu
    // Zostanie zaimplementowana przez ProjectStore i przekazana do containerManagera
    return [];
  }
});