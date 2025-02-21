// src/utils/documents/documentUtils.ts
import { 
    Document, 
    DocumentContainer, 
    AddDocumentInput, 
    AddContainerInput
  } from "@/types/document";
  import { RelationConfig, DocumentRelation } from "@/types/relation";
  
  export const validateContainerName = (
    containers: DocumentContainer[],
    name: string,
    excludeId?: string
  ): boolean => {
    return !containers.some(
      container => 
        container.id !== excludeId && 
        container.name.toLowerCase() === name.toLowerCase()
    );
  };
  
  export const createNewContainer = (container: AddContainerInput): DocumentContainer => {
    return {
      ...container,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
  };
  
  export const validateContainerDeletion = (
    containerId: string,
    relations: DocumentRelation[]
  ): boolean => {
    return !relations.some(
      rel => rel.sourceContainerId === containerId || rel.targetContainerId === containerId
    );
  };
  
  export const createNewDocument = (document: AddDocumentInput): Document => {
    if (!document.title) {
      throw new Error("Document title is required");
    }
  
    if (!document.documentContainerId) {
      throw new Error("Document container ID is required");
    }
  
    const newDocument: Document = {
      id: Date.now().toString(),
      title: String(document.title),
      content: document.content ? String(document.content) : "",
      documentContainerId: String(document.documentContainerId),
      order: typeof document.order === 'number' ? document.order : 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  
    // Add custom fields
    const customFields = Object.entries(document)
      .filter(([key]) => !['id', 'title', 'content', 'documentContainerId', 'order', 'createdAt', 'updatedAt'].includes(key))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
  
    return { ...newDocument, ...customFields };
  };
  
  export const validateRelation = (
    sourceDocId: string,
    targetDocId: string,
    configId: string,
    documents: Document[],
    relationConfigs: RelationConfig[],
    relations: DocumentRelation[]
  ): { isValid: boolean; error?: string } => {
    const config = relationConfigs.find(c => c.id === configId);
    if (!config) {
      return { isValid: false, error: "Relation config not found" };
    }
  
    const sourceDoc = documents.find(d => d.id === sourceDocId);
    const targetDoc = documents.find(d => d.id === targetDocId);
  
    if (!sourceDoc || !targetDoc) {
      return { isValid: false, error: "Source or target document not found" };
    }
  
    if (
      sourceDoc.documentContainerId !== config.sourceContainerId ||
      targetDoc.documentContainerId !== config.targetContainerId
    ) {
      return { isValid: false, error: "Documents container mismatch with relation config" };
    }
  
    if (config.type === "OneToOne") {
      const existingRelation = relations.find(
        rel =>
          (rel.sourceDocumentId === sourceDocId || rel.targetDocumentId === targetDocId) &&
          rel.configId === configId
      );
  
      if (existingRelation) {
        return { isValid: false, error: "OneToOne relation already exists for one of the documents" };
      }
    }
  
    return { isValid: true };
  };
  
  export const createNewRelation = (
    sourceDocId: string,
    targetDocId: string,
    configId: string,
    sourceDoc: Document,
    targetDoc: Document
  ): DocumentRelation => {
    return {
      id: Date.now().toString(),
      sourceDocumentId: sourceDocId,
      sourceContainerId: sourceDoc.documentContainerId,
      targetDocumentId: targetDocId,
      targetContainerId: targetDoc.documentContainerId,
      configId,
      createdAt: new Date(),
    };
  };
  
  export const filterDocumentsByContainer = (
    documents: Document[],
    documentContainerId: string
  ): Document[] => {
    return documents
      .filter(doc => doc.documentContainerId === documentContainerId)
      .sort((a, b) => a.order - b.order);
  };
  
  export const getRelatedDocumentsForContainer = (
    documentId: string,
    targetContainerId: string | undefined,
    documents: Document[],
    relations: DocumentRelation[]
  ): Document[] => {
    const relevantRelations = relations.filter(
      rel =>
        (rel.sourceDocumentId === documentId || rel.targetDocumentId === documentId) &&
        (!targetContainerId || rel.targetContainerId === targetContainerId)
    );
  
    const relatedDocIds = relevantRelations.map(rel =>
      rel.sourceDocumentId === documentId ? rel.targetDocumentId : rel.sourceDocumentId
    );
  
    return documents.filter(doc => relatedDocIds.includes(doc.id));
  };
  
  export const getAvailableConfigs = (
    sourceContainerId: string,
    relationConfigs: RelationConfig[]
  ): RelationConfig[] => {
    return relationConfigs.filter(
      config => config.sourceContainerId === sourceContainerId
    );
  };