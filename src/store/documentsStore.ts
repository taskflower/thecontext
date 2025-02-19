/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/documentsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DocumentsStore,
  DocumentContainer,
  Document,
  AddContainerInput,
  AddDocumentInput,
} from "@/types/document";
import { flattenCustomFields, isCustomField } from "@/utils/documentFields";

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      containers: [],
      documents: [],
      contexts: [],

      addContainer: (container: AddContainerInput) => {
        const { containers } = get();
        const isNameTaken = containers.some(
          (existingContainer) =>
            existingContainer.name.toLowerCase() ===
            container.name.toLowerCase()
        );

        if (isNameTaken) {
          throw new Error(
            `Container with name "${container.name}" already exists`
          );
        }

        const newContainer = {
          ...container,
          id: Date.now().toString(),
          createdAt: new Date(),
        };

        set((state) => {
          const newState = {
            containers: [...state.containers, newContainer],
          };

          return newState;
        });
      },

      updateContainer: (id: string, updates: Partial<DocumentContainer>) => {
        const { containers } = get();

        if (typeof updates.name === "string") {
          const isNameTaken = containers.some(
            (existingContainer) =>
              existingContainer.id !== id &&
              existingContainer.name.toLowerCase() ===
                updates.name!.toLowerCase()
          );

          if (isNameTaken) {
            throw new Error(
              `Container with name "${updates.name}" already exists`
            );
          }
        }

        set((state) => {
          const newState = {
            containers: state.containers.map((container) =>
              container.id === id ? { ...container, ...updates } : container
            ),
          };

          return newState;
        });
      },

      deleteContainer: (id: string) => {
        set((state) => ({
          containers: state.containers.filter(
            (container) => container.id !== id
          ),
          documents: state.documents.filter(
            (doc) => doc.documentContainerId !== id
          ),
          contexts: state.contexts.filter(
            (ctx) => ctx.documentContainerId !== id
          ),
        }));
      },

      addDocument: (document: AddDocumentInput) => {
        const { customFields, ...restDocument } = document as any;
        const flattenedFields = customFields
          ? flattenCustomFields(customFields)
          : {};

        const newDocument = {
          ...restDocument,
          ...flattenedFields,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          documents: [...state.documents, newDocument],
        }));
      },

      updateDocument: (id: string, updates: Partial<Document>) => {
        const { customFields, ...restUpdates } = updates as any;
        const flattenedFields = customFields
          ? flattenCustomFields(customFields)
          : {};

        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== id) return doc;

            // Remove existing custom fields
            const cleanDoc = Object.entries(doc).reduce(
              (acc, [key, value]) =>
                isCustomField(key) ? acc : { ...acc, [key]: value },
              {}
            );

            const updatedDoc = {
              ...cleanDoc,
              ...restUpdates,
              ...flattenedFields,
              updatedAt: new Date(),
            };

            return updatedDoc;
          }),
        }));
      },

      removeDocument: (id: string) => {
        set((state) => ({
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },

      getContainerDocuments: (documentContainerId: string) => {
        const { documents } = get();
        const containerDocs = documents
          .filter((doc) => doc.documentContainerId === documentContainerId)
          .sort((a, b) => a.order - b.order);

        return containerDocs;
      },

      linkContainerToInstance: (
        documentContainerId: string,
        instanceId: string
      ) => {
        set((state) => {
          const existingContext = state.contexts.find(
            (ctx) => ctx.documentContainerId === documentContainerId
          );

          if (existingContext) {
            return {
              contexts: state.contexts.map((ctx) =>
                ctx.documentContainerId === documentContainerId
                  ? {
                      ...ctx,
                      instanceIds: [
                        ...new Set([...ctx.instanceIds, instanceId]),
                      ],
                    }
                  : ctx
              ),
            };
          }

          return {
            contexts: [
              ...state.contexts,
              {
                documentContainerId,
                instanceIds: [instanceId],
              },
            ],
          };
        });
      },

      reset: () => {
        set(() => ({
          containers: [],
          documents: [],
          contexts: [],
        }));
      },
    }),
    {
      name: "documents-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        containers: state.containers,
        documents: state.documents,
        contexts: state.contexts,
      }),
    }
  )
);
