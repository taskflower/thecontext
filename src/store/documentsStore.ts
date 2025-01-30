/* eslint-disable @typescript-eslint/no-explicit-any */
import { DocumentsStore } from '@/types/document';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      containers: [],
      documents: [],
      contexts: [],

      addContainer: (container) =>
        set((state) => ({
          containers: [...state.containers, {
            ...container,
            id: Date.now().toString(),
            createdAt: new Date()
          }]
        })),

      updateContainer: (id: string, updates: any) =>
        set((state) => ({
          containers: state.containers.map(container =>
            container.id === id
              ? { ...container, ...updates }
              : container
          )
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