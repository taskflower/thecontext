// src/utils/documents/relationUtils.ts
import { Document } from "@/types/document";
import { DocumentRelation, RelationConfig } from "@/types/relation";
import { Errors } from "../errors";

export const processRelationAddition = (
  sourceDocId: string,
  targetDocId: string,
  configId: string,
  state: {
    documents: Document[],
    relationConfigs: RelationConfig[],
    relations: DocumentRelation[]
  }
) => {
  const { documents, relationConfigs, relations } = state;

  const config = relationConfigs.find(c => c.id === configId);
  if (!config) {
    return { error: Errors.RELATION_CONFIG_NOT_FOUND() };
  }

  const sourceDoc = documents.find(d => d.id === sourceDocId);
  const targetDoc = documents.find(d => d.id === targetDocId);

  if (!sourceDoc || !targetDoc) {
    return { error: Errors.DOCUMENT_NOT_FOUND() };
  }

  if (
    sourceDoc.documentContainerId !== config.sourceContainerId ||
    targetDoc.documentContainerId !== config.targetContainerId
  ) {
    return { error: Errors.INVALID_RELATION('Container mismatch') };
  }

  if (config.type === "OneToOne") {
    const existingRelation = relations.find(
      rel =>
        (rel.sourceDocumentId === sourceDocId || rel.targetDocumentId === targetDocId) &&
        rel.configId === configId
    );

    if (existingRelation) {
      return { error: Errors.INVALID_RELATION('OneToOne relation already exists') };
    }
  }

  const newRelation = createRelation(sourceDocId, targetDocId, configId, sourceDoc, targetDoc);
  return { newRelation };
};

export const createRelation = (
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

export const getRelatedDocuments = (
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

export const getAvailableRelationConfigs = (
  sourceContainerId: string,
  relationConfigs: RelationConfig[]
): RelationConfig[] => {
  return relationConfigs.filter(
    config => config.sourceContainerId === sourceContainerId
  );
};

export const processRelationConfigRemoval = (
  configId: string,
  relations: DocumentRelation[]
) => {
  const isConfigInUse = relations.some((rel) => rel.configId === configId);

  if (isConfigInUse) {
    return { 
      canRemove: false, 
      error: Errors.RELATION_CONFIG_IN_USE() 
    };
  }

  return { canRemove: true };
};