import { DocumentsStore } from '@/types/document';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      containers: [],
      documents: [],
      contexts: [],

      addContainer: (container) => {
        const { containers } = get();
        const isNameTaken = containers.some(
          existingContainer => existingContainer.name.toLowerCase() === container.name.toLowerCase()
        );

        if (isNameTaken) {
          throw new Error(`Container with name "${container.name}" already exists`);
        }

        set((state) => ({
          containers: [...state.containers, {
            ...container,
            id: Date.now().toString(),
            createdAt: new Date()
          }]
        }));
      },

      updateContainer: (id, updates) => {
        const { containers } = get();
        
        if (updates.name) {
          const isNameTaken = containers.some(
            existingContainer => 
              existingContainer.id !== id && 
              existingContainer.name.toLowerCase() === updates.name.toLowerCase()
          );

          if (isNameTaken) {
            throw new Error(`Container with name "${updates.name}" already exists`);
          }
        }

        set((state) => ({
          containers: state.containers.map(container =>
            container.id === id
              ? { ...container, ...updates }
              : container
          )
        }));
      },

      deleteContainer: (id: string) => 
        set((state) => ({
          containers: state.containers.filter(container => container.id !== id),
          documents: state.documents.filter(doc => doc.documentContainerId !== id),
          contexts: state.contexts.filter(ctx => ctx.documentContainerId !== id)
        })),

      addDocument: (document) =>
        set((state) => ({
          documents: [...state.documents, {
            ...document,
            id: Date.now().toString(),
            createdAt: new Date(),
            updatedAt: new Date()
          }]
        })),

      updateDocument: (id, updates) =>
        set((state) => ({
          documents: state.documents.map(doc =>
            doc.id === id
              ? { ...doc, ...updates, updatedAt: new Date() }
              : doc
          )
        })),

      removeDocument: (id) =>
        set((state) => ({
          documents: state.documents.filter(doc => doc.id !== id)
        })),

      getContainerDocuments: (documentContainerId) => {
        const { documents } = get();
        return documents
          .filter(doc => doc.documentContainerId === documentContainerId)
          .sort((a, b) => a.order - b.order);
      },

      reset: () => 
        set(() => ({
          containers: [],
          documents: [],
          contexts: []
        })),

      linkContainerToInstance: (documentContainerId, instanceId) =>
        set((state) => {
          const existingContext = state.contexts.find(
            ctx => ctx.documentContainerId === documentContainerId
          );

          if (existingContext) {
            return {
              contexts: state.contexts.map(ctx =>
                ctx.documentContainerId === documentContainerId
                  ? {
                      ...ctx,
                      instanceIds: [...new Set([...ctx.instanceIds, instanceId])]
                    }
                  : ctx
              )
            };
          }

          return {
            contexts: [...state.contexts, {
              documentContainerId,
              instanceIds: [instanceId]
            }]
          };
        })
    }),
    {
      name: 'documents-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        containers: state.containers,
        documents: state.documents,
        contexts: state.contexts
      }),
    }
  )
);