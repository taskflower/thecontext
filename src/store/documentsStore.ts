// src/store/documentsStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DocumentsStore,
  DocumentContainer,
  Document,
  AddContainerInput,
  AddDocumentInput
} from "@/types/document";
import { RelationConfig } from "@/types/relation";
import {
  isContainerNameUnique,       // wcześniej validateContainerName
  createContainer,             // wcześniej createNewContainer
  canDeleteContainer,          // wcześniej validateContainerDeletion
  createDocument,              // wcześniej createNewDocument
  isRelationValid,             // wcześniej validateRelation
  createRelation,              // wcześniej createNewRelation
  filterDocumentsByContainer,
  getRelatedDocuments,         // wcześniej getRelatedDocumentsForContainer
  getAvailableRelationConfigs, // wcześniej getAvailableConfigs
  autoCreateRelations          // funkcja do automatycznego tworzenia relacji
} from "@/utils/documents/documentUtils";

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      containers: [],
      documents: [],
      contexts: [],
      relations: [],
      relationConfigs: [],

      addContainer: (container: AddContainerInput) => {
        const { containers } = get();

        if (!isContainerNameUnique(containers, container.name)) {
          throw new Error(`Container with name "${container.name}" already exists`);
        }

        const newContainer = createContainer(container);

        set((state) => ({
          ...state,
          containers: [...state.containers, newContainer],
        }));
      },

      updateContainer: (id: string, updates: Partial<DocumentContainer>) => {
        const { containers } = get();

        if (typeof updates.name === "string" && !isContainerNameUnique(containers, updates.name, id)) {
          throw new Error(`Container with name "${updates.name}" already exists`);
        }

        set((state) => ({
          ...state,
          containers: state.containers.map((container) =>
            container.id === id ? { ...container, ...updates } : container
          ),
        }));
      },

      deleteContainer: (id: string) => {
        const { relations } = get();

        if (!canDeleteContainer(id, relations)) {
          throw new Error("Cannot delete container with existing relations. Remove relations first.");
        }

        set((state) => ({
          ...state,
          containers: state.containers.filter((container) => container.id !== id),
          documents: state.documents.filter((doc) => doc.documentContainerId !== id),
          contexts: state.contexts.filter((ctx) => ctx.documentContainerId !== id),
        }));
      },

      addDocument: (document: AddDocumentInput) => {
        const newDocument = createDocument(document);

        set((state) => {
          const updatedDocuments = [...state.documents, newDocument];
          const newRelations = autoCreateRelations(
            newDocument,
            updatedDocuments,
            state.relationConfigs,
            state.relations
          );
          return {
            ...state,
            documents: updatedDocuments,
            relations: [...state.relations, ...newRelations],
          };
        });
      },

      updateDocument: (id: string, updates: Partial<Document>) => {
        set((state) => {
          const updatedDocuments = state.documents.map((doc) =>
            doc.id === id
              ? {
                  ...doc,
                  ...updates,
                  updatedAt: new Date(),
                }
              : doc
          );
          const updatedDocument = updatedDocuments.find((doc) => doc.id === id)!;
          const newRelations = autoCreateRelations(
            updatedDocument,
            updatedDocuments,
            state.relationConfigs,
            state.relations
          );
          return {
            ...state,
            documents: updatedDocuments,
            relations: [...state.relations, ...newRelations],
          };
        });
      },

      removeDocument: (id: string) => {
        set((state) => ({
          ...state,
          relations: state.relations.filter(
            (rel) => rel.sourceDocumentId !== id && rel.targetDocumentId !== id
          ),
          documents: state.documents.filter((doc) => doc.id !== id),
        }));
      },

      addRelationConfig: (config: Omit<RelationConfig, "id">) => {
        set((state) => ({
          ...state,
          relationConfigs: [
            ...state.relationConfigs,
            { ...config, id: Date.now().toString() },
          ],
        }));
      },

      removeRelationConfig: (configId: string) => {
        const { relations } = get();
        const isConfigInUse = relations.some((rel) => rel.configId === configId);

        if (isConfigInUse) {
          throw new Error("Cannot delete relation config that is in use");
        }

        set((state) => ({
          ...state,
          relationConfigs: state.relationConfigs.filter((config) => config.id !== configId),
        }));
      },

      addRelation: (sourceDocId: string, targetDocId: string, configId: string) => {
        const { documents, relationConfigs, relations } = get();

        const validationResult = isRelationValid(
          sourceDocId,
          targetDocId,
          configId,
          documents,
          relationConfigs,
          relations
        );

        if (!validationResult.isValid) {
          throw new Error(validationResult.error);
        }

        const sourceDoc = documents.find((d) => d.id === sourceDocId)!;
        const targetDoc = documents.find((d) => d.id === targetDocId)!;

        const newRelation = createRelation(
          sourceDocId,
          targetDocId,
          configId,
          sourceDoc,
          targetDoc
        );

        set((state) => ({
          ...state,
          relations: [...state.relations, newRelation],
        }));
      },

      removeRelation: (relationId: string) => {
        set((state) => ({
          ...state,
          relations: state.relations.filter((rel) => rel.id !== relationId),
        }));
      },

      getContainerDocuments: (documentContainerId: string) => {
        const { documents } = get();
        return filterDocumentsByContainer(documents, documentContainerId);
      },

      getDocumentRelations: (documentId: string) => {
        const { relations } = get();
        return relations.filter(
          (rel) => rel.sourceDocumentId === documentId || rel.targetDocumentId === documentId
        );
      },

      getRelatedDocuments: (documentId: string, targetContainerId?: string) => {
        const { documents, relations } = get();
        return getRelatedDocuments(documentId, targetContainerId, documents, relations);
      },

      getAvailableRelationConfigs: (sourceContainerId: string) => {
        const { relationConfigs } = get();
        return getAvailableRelationConfigs(sourceContainerId, relationConfigs);
      },

      linkContainerToInstance: (documentContainerId: string, instanceId: string) => {
        set((state) => {
          const existingContext = state.contexts.find(
            (ctx) => ctx.documentContainerId === documentContainerId
          );

          if (existingContext) {
            return {
              ...state,
              contexts: state.contexts.map((ctx) =>
                ctx.documentContainerId === documentContainerId
                  ? {
                      ...ctx,
                      instanceIds: [...new Set([...ctx.instanceIds, instanceId])],
                    }
                  : ctx
              ),
            };
          }

          return {
            ...state,
            contexts: [
              ...state.contexts,
              { documentContainerId, instanceIds: [instanceId] },
            ],
          };
        });
      },

      reset: () => {
        set({
          containers: [],
          documents: [],
          contexts: [],
          relations: [],
          relationConfigs: [],
        });
      },
    }),
    {
      name: "documents-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        containers: state.containers,
        documents: state.documents,
        contexts: state.contexts,
        relations: state.relations,
        relationConfigs: state.relationConfigs,
      }),
    }
  )
);
