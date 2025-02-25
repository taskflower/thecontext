/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";


import { ContainerManager, generateId } from "@/utils/utils";
import { IContainer, IContainerDocument, IContainerRelation, IDocumentSchema } from "@/utils/documents/documentTypes";


interface DocumentState {
  containers: IContainer[];
  relations: IContainerRelation[];
  containerManager: ContainerManager;
  
  // Container operations
  addContainer: (name: string) => string;
  updateContainer: (id: string, updates: Partial<IContainer>) => void;
  removeContainer: (id: string) => void;
  
  // Document operations
  addDocument: (containerId: string, document: Omit<IContainerDocument, "id">) => string;
  updateDocument: (containerId: string, documentId: string, updates: Partial<IContainerDocument>) => void;
  removeDocument: (containerId: string, documentId: string) => void;
  
  // Schema operations
  addSchema: (containerId: string, schema: Omit<IDocumentSchema, "id">) => string;
  updateSchema: (containerId: string, schemaId: string, updates: Partial<IDocumentSchema>) => void;
  removeSchema: (containerId: string, schemaId: string) => void;
  
  // Relation operations
  addRelation: (relation: Omit<IContainerRelation, "id">) => string;
  updateRelation: (id: string, updates: Partial<IContainerRelation>) => void;
  removeRelation: (id: string) => void;
  
  // Query methods
  getDocumentsByRelation: (relationId: string) => IContainerDocument[];
}

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      containers: [],
      relations: [],
      containerManager: new ContainerManager(),
      
      // Container operations
      addContainer: (name: string) => {
        const id = generateId();
        set((state) => ({
          containers: [
            ...state.containers,
            {
              id,
              name,
              documents: [],
              schemas: [],
              customFields: {}
            }
          ]
        }));
        return id;
      },
      
      updateContainer: (id: string, updates: Partial<IContainer>) => 
        set((state) => ({
          containers: state.containers.map((container) => 
            container.id === id ? { ...container, ...updates } : container
          )
        })),
      
      removeContainer: (id: string) => 
        set((state) => ({
          containers: state.containers.filter((container) => container.id !== id),
          relations: state.relations.filter(
            (relation) => 
              relation.sourceContainerId !== id && relation.targetContainerId !== id
          )
        })),
      
      // Document operations
      addDocument: (containerId: string, document: Omit<IContainerDocument, "id">) => {
        const documentId = generateId();
        set((state) => ({
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
          containers: state.containers.map((container) => 
            container.id === containerId
              ? {
                  ...container,
                  documents: container.documents.filter((doc) => doc.id !== documentId)
                }
              : container
          )
        })),
      
      // Schema operations
      addSchema: (containerId: string, schema: Omit<IDocumentSchema, "id">) => {
        const schemaId = generateId();
        set((state) => ({
          containers: state.containers.map((container) => 
            container.id === containerId
              ? {
                  ...container,
                  schemas: [
                    ...container.schemas,
                    {
                      id: schemaId,
                      name: schema.name,
                      fields: schema.fields || []
                    }
                  ]
                }
              : container
          )
        }));
        return schemaId;
      },
      
      updateSchema: (containerId: string, schemaId: string, updates: Partial<IDocumentSchema>) => 
        set((state) => ({
          containers: state.containers.map((container) => 
            container.id === containerId
              ? {
                  ...container,
                  schemas: container.schemas.map((schema) => 
                    schema.id === schemaId ? { ...schema, ...updates } : schema
                  )
                }
              : container
          )
        })),
      
      removeSchema: (containerId: string, schemaId: string) => 
        set((state) => ({
          containers: state.containers.map((container) => 
            container.id === containerId
              ? {
                  ...container,
                  schemas: container.schemas.filter((schema) => schema.id !== schemaId),
                  documents: container.documents.map(doc => 
                    doc.schemaId === schemaId 
                      ? { ...doc, schemaId: container.schemas[0]?.id || 'default' }
                      : doc
                  )
                }
              : container
          )
        })),
      
      // Relation operations
      addRelation: (relation: Omit<IContainerRelation, "id">) => {
        const id = generateId();
        set((state) => ({
          relations: [
            ...state.relations,
            {
              id,
              sourceContainerId: relation.sourceContainerId,
              targetContainerId: relation.targetContainerId,
              sourceField: relation.sourceField,
              targetField: relation.targetField,
              condition: relation.condition
            }
          ]
        }));
        return id;
      },
      
      updateRelation: (id: string, updates: Partial<IContainerRelation>) => 
        set((state) => ({
          relations: state.relations.map((relation) => 
            relation.id === id ? { ...relation, ...updates } : relation
          )
        })),
      
      removeRelation: (id: string) => 
        set((state) => ({
          relations: state.relations.filter((relation) => relation.id !== id)
        })),
      
      // Query methods
      getDocumentsByRelation: (relationId: string) => {
        const { relations, containers, containerManager } = get();
        const relation = relations.find(r => r.id === relationId);
        if (!relation) return [];
        
        return containerManager.filterDocumentsByRelation(relation, containers);
      }
    }),
    {
      name: "document-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        containers: state.containers,
        relations: state.relations
      })
    }
  )
);