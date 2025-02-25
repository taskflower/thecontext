import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Document, DocumentContainer, AddDocumentInput } from '@/types/document';
import { DocumentRelation, RelationConfig } from '@/types/relation';
import { processDocumentAddition, processDocumentUpdate, filterDocumentsByContainer } from '@/utils/documents';
import { createContainer, canDeleteContainer } from '@/utils/documents/containerUtils';
import { processRelationAddition } from '@/utils/documents/relationUtils';

interface DocumentsStore {
  // State
  documents: Document[];
  containers: DocumentContainer[];
  relations: DocumentRelation[];
  relationConfigs: RelationConfig[];

  // Document queries
  getContainerDocuments: (containerId: string) => Document[];

  // Document actions
  addDocument: (document: AddDocumentInput) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  deleteDocument: (id: string) => void;
  removeDocument: (id: string) => void; 

  // Container actions
  addContainer: (container: Omit<DocumentContainer, 'id' | 'createdAt'>) => void;
  updateContainer: (id: string, updates: Partial<DocumentContainer>) => void;
  deleteContainer: (id: string) => void;

  // Relation actions
  addRelation: (sourceDocId: string, targetDocId: string, configId: string) => void;
  deleteRelation: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      documents: [],
      containers: [],
      relations: [],
      relationConfigs: [],

      // Queries
      getContainerDocuments: (containerId: string) =>
        filterDocumentsByContainer(get().documents, containerId),

      // Document operations
      addDocument: (document) =>
        set(({ documents, relationConfigs, relations }) => {
          const result = processDocumentAddition(document, {
            documents,
            relationConfigs,
            relations,
          });
          return {
            documents: result.documents,
            relations: result.relations,
          };
        }),

      updateDocument: (id, updates) =>
        set(({ documents, relationConfigs, relations }) => {
          const result = processDocumentUpdate(id, updates, {
            documents,
            relationConfigs,
            relations,
          });
          return {
            documents: result.documents,
            relations: result.relations,
          };
        }),

      deleteDocument: (id) =>
        set(({ documents, relations }) => ({
          documents: documents.filter((doc) => doc.id !== id),
          relations: relations.filter(
            (rel) =>
              rel.sourceDocumentId !== id && rel.targetDocumentId !== id
          ),
        })),

      removeDocument: (id) => get().deleteDocument(id),

      // Container operations
      addContainer: (container) =>
        set(({ containers }) => ({
          containers: [...containers, createContainer(container)],
        })),

      updateContainer: (id, updates) =>
        set(({ containers }) => ({
          containers: containers.map((container) =>
            container.id === id ? { ...container, ...updates } : container
          ),
        })),

      deleteContainer: (id) =>
        set(({ containers, documents, relations }) => {
          if (!canDeleteContainer(id, relations)) {
            console.error("Cannot delete container because it is used by relations.");
            return { containers, documents, relations };
          }
          return {
            containers: containers.filter((container) => container.id !== id),
            documents: documents.filter((doc) => doc.documentContainerId !== id),
          };
        }),

      // Relation operations
      addRelation: (sourceDocId, targetDocId, configId) =>
        set(({ documents, relationConfigs, relations }) => {
          const result = processRelationAddition(sourceDocId, targetDocId, configId, {
            documents,
            relationConfigs,
            relations,
          });
          if (result.newRelation) {
            return {
              relations: [...relations, result.newRelation],
            };
          }
          console.error(result.error);
          return {};
        }),

      deleteRelation: (id) =>
        set(({ relations }) => ({
          relations: relations.filter((relation) => relation.id !== id),
        })),
    }),
    {
      name: 'documents-store',
    }
  )
);
