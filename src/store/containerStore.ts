// store/containerStore.ts
import { ContainerManager } from '@/utils/containers/containerUtils';
import { IContainer, IContainerRelation, IContainerDocument, IDocumentSchema } from '@/utils/containers/types';
import { create } from 'zustand';


interface ContainerState {
    containers: IContainer[];
    relations: IContainerRelation[];
    selectedContainer: string | null;
    filteredDocuments: IContainerDocument[];
    containerManager: ContainerManager;

    // Actions
    addContainer: (container: IContainer) => void;
    removeContainer: (containerId: string) => void;
    addDocument: (containerId: string, document: IContainerDocument) => void;
    removeDocument: (containerId: string, documentId: string) => void;
    addRelation: (relation: IContainerRelation) => void;
    removeRelation: (relationId: string) => void;
    setSelectedContainer: (containerId: string | null) => void;
    updateFilteredDocuments: (relationId: string) => void;
    addSchema: (containerId: string, schema: IDocumentSchema) => void;
}

export const useContainerStore = create<ContainerState>((set, get) => ({
    containers: [],
    relations: [],
    selectedContainer: null,
    filteredDocuments: [],
    containerManager: new ContainerManager(),

    addContainer: (container) => 
        set((state) => ({ containers: [...state.containers, container] })),

    removeContainer: (containerId) =>
        set((state) => ({
            containers: state.containers.filter((c) => c.id !== containerId),
            relations: state.relations.filter(
                (r) => r.sourceContainerId !== containerId && r.targetContainerId !== containerId
            ),
        })),

    addDocument: (containerId, document) =>
        set((state) => ({
            containers: state.containers.map((container) =>
                container.id === containerId
                    ? { ...container, documents: [...container.documents, document] }
                    : container
            ),
        })),

    removeDocument: (containerId, documentId) =>
        set((state) => ({
            containers: state.containers.map((container) =>
                container.id === containerId
                    ? {
                          ...container,
                          documents: container.documents.filter((d) => d.id !== documentId),
                      }
                    : container
            ),
        })),

    addRelation: (relation) =>
        set((state) => {
            if (state.containerManager.validateRelation(relation, state.containers)) {
                return { relations: [...state.relations, relation] };
            }
            return state;
        }),

    removeRelation: (relationId) =>
        set((state) => ({
            relations: state.relations.filter((r) => r.id !== relationId),
        })),

    setSelectedContainer: (containerId) =>
        set({ selectedContainer: containerId }),

    updateFilteredDocuments: (relationId) =>
        set((state) => {
            const relation = state.relations.find((r) => r.id === relationId);
            if (!relation) return state;

            const filteredDocs = state.containerManager.filterDocumentsByRelation(
                relation,
                state.containers
            );

            return { filteredDocuments: filteredDocs };
        }),

    addSchema: (containerId, schema) =>
        set((state) => ({
            containers: state.containers.map((container) =>
                container.id === containerId
                    ? { ...container, schemas: [...container.schemas, schema] }
                    : container
            ),
        })),
}));