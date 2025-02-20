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
  DocumentRelation,
} from "@/types/document";
import { flattenCustomFields, isCustomField } from "@/utils/documentFields";

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
        const isNameTaken = containers.some(
          (existingContainer) =>
            existingContainer.name.toLowerCase() === container.name.toLowerCase()
        );

        if (isNameTaken) {
          throw new Error(`Container with name "${container.name}" already exists`);
        }

        const newContainer = {
          ...container,
          id: Date.now().toString(),
          createdAt: new Date(),
        };

        set((state) => ({
          containers: [...state.containers, newContainer],
        }));
      },

      updateContainer: (id: string, updates: Partial<DocumentContainer>) => {
        const { containers } = get();

        if (typeof updates.name === "string") {
          const isNameTaken = containers.some(
            (existingContainer) =>
              existingContainer.id !== id &&
              existingContainer.name.toLowerCase() === updates.name!.toLowerCase()
          );

          if (isNameTaken) {
            throw new Error(`Container with name "${updates.name}" already exists`);
          }
        }

        set((state) => ({
          containers: state.containers.map((container) =>
            container.id === id ? { ...container, ...updates } : container
          ),
        }));
      },

      deleteContainer: (id: string) => {
        const { relations } = get();
        
        // Check for existing relations
        const hasRelations = relations.some(
          rel => rel.sourceContainerId === id || rel.targetContainerId === id
        );
        
        if (hasRelations) {
          throw new Error("Cannot delete container with existing relations. Remove relations first.");
        }

        set((state) => ({
          containers: state.containers.filter((container) => container.id !== id),
          documents: state.documents.filter((doc) => doc.documentContainerId !== id),
          contexts: state.contexts.filter((ctx) => ctx.documentContainerId !== id),
        }));
      },

      addDocument: (document: AddDocumentInput) => {
        const { customFields, ...restDocument } = document as any;
        const flattenedFields = customFields ? flattenCustomFields(customFields) : {};

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
        const flattenedFields = customFields ? flattenCustomFields(customFields) : {};

        set((state) => ({
          documents: state.documents.map((doc) => {
            if (doc.id !== id) return doc;

            const cleanDoc = Object.entries(doc).reduce(
              (acc, [key, value]) =>
                isCustomField(key) ? acc : { ...acc, [key]: value },
              {}
            );

            return {
              ...cleanDoc,
              ...restUpdates,
              ...flattenedFields,
              updatedAt: new Date(),
            };
          }),
        }));
      },

      removeDocument: (id: string) => {
        const { relations } = get();
        
        // Check for existing relations
        const hasRelations = relations.some(
          rel => rel.sourceDocumentId === id || rel.targetDocumentId === id
        );
        
        if (hasRelations) {
          // Delete all related relations first
          set((state) => ({
            relations: state.relations.filter(
              rel => rel.sourceDocumentId !== id && rel.targetDocumentId !== id
            ),
            documents: state.documents.filter((doc) => doc.id !== id),
          }));
        } else {
          set((state) => ({
            documents: state.documents.filter((doc) => doc.id !== id),
          }));
        }
      },

      // Relation Config Operations
      addRelationConfig: (config) => {
        const newConfig = {
          ...config,
          id: Date.now().toString(),
        };

        set((state) => ({
          relationConfigs: [...state.relationConfigs, newConfig],
        }));
      },

      removeRelationConfig: (configId: string) => {
        const { relations } = get();
        
        // Check if config is in use
        const isConfigInUse = relations.some(rel => rel.configId === configId);
        
        if (isConfigInUse) {
          throw new Error("Cannot delete relation config that is in use");
        }
        
        set((state) => ({
          relationConfigs: state.relationConfigs.filter(config => config.id !== configId),
        }));
      },

      // Relation Operations
      addRelation: (sourceDocId: string, targetDocId: string, configId: string) => {
        const { documents, relationConfigs, relations } = get();
        
        const config = relationConfigs.find(c => c.id === configId);
        if (!config) {
          throw new Error("Relation config not found");
        }

        const sourceDoc = documents.find(d => d.id === sourceDocId);
        const targetDoc = documents.find(d => d.id === targetDocId);
        
        if (!sourceDoc || !targetDoc) {
          throw new Error("Source or target document not found");
        }

        if (sourceDoc.documentContainerId !== config.sourceContainerId || 
            targetDoc.documentContainerId !== config.targetContainerId) {
          throw new Error("Documents container mismatch with relation config");
        }

        // Check OneToOne constraint
        if (config.type === 'OneToOne') {
          const existingRelation = relations.find(
            rel => (rel.sourceDocumentId === sourceDocId || rel.targetDocumentId === targetDocId) &&
                  rel.configId === configId
          );
          
          if (existingRelation) {
            throw new Error("OneToOne relation already exists for one of the documents");
          }
        }

        const newRelation: DocumentRelation = {
          id: Date.now().toString(),
          sourceDocumentId: sourceDocId,
          sourceContainerId: sourceDoc.documentContainerId,
          targetDocumentId: targetDocId,
          targetContainerId: targetDoc.documentContainerId,
          configId,
          createdAt: new Date()
        };

        set((state) => ({
          relations: [...state.relations, newRelation],
        }));
      },

      removeRelation: (relationId: string) => {
        set((state) => ({
          relations: state.relations.filter(rel => rel.id !== relationId),
        }));
      },

      // Query Operations
      getContainerDocuments: (documentContainerId: string) => {
        const { documents } = get();
        return documents
          .filter((doc) => doc.documentContainerId === documentContainerId)
          .sort((a, b) => a.order - b.order);
      },

      getDocumentRelations: (documentId: string) => {
        const { relations } = get();
        return relations.filter(
          rel => rel.sourceDocumentId === documentId || rel.targetDocumentId === documentId
        );
      },

      getRelatedDocuments: (documentId: string, targetContainerId?: string) => {
        const { documents, relations } = get();
        
        const relevantRelations = relations.filter(rel => 
          (rel.sourceDocumentId === documentId || rel.targetDocumentId === documentId) &&
          (!targetContainerId || rel.targetContainerId === targetContainerId)
        );

        const relatedDocIds = relevantRelations.map(rel => 
          rel.sourceDocumentId === documentId ? rel.targetDocumentId : rel.sourceDocumentId
        );

        return documents.filter(doc => relatedDocIds.includes(doc.id));
      },

      getAvailableRelationConfigs: (sourceContainerId: string) => {
        const { relationConfigs } = get();
        return relationConfigs.filter(config => config.sourceContainerId === sourceContainerId);
      },

      // Existing Context Operations
      linkContainerToInstance: (documentContainerId: string, instanceId: string) => {
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
                      instanceIds: [...new Set([...ctx.instanceIds, instanceId])],
                    }
                  : ctx
              ),
            };
          }

          return {
            contexts: [
              ...state.contexts,
              { documentContainerId, instanceIds: [instanceId] },
            ],
          };
        });
      },

      reset: () => {
        set(() => ({
          containers: [],
          documents: [],
          contexts: [],
          relations: [],
          relationConfigs: []
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
        relations: state.relations,
        relationConfigs: state.relationConfigs
      }),
    }
  )
);