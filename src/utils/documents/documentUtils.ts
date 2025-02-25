// src/utils/documents/documentUtils.ts
import { Document, AddDocumentInput } from "@/types/document";
import { DocumentRelation, RelationConfig } from "@/types/relation";
import { Errors } from "../errors";
import { autoCreateRelations } from "./autoRelationUtils";

export const createDocument = (document: AddDocumentInput): Document => {
  const newDocument: Document = {
    id: Date.now().toString(),
    title: String(document.title),
    content: document.content ? String(document.content) : "",
    documentContainerId: String(document.documentContainerId),
    order: typeof document.order === 'number' ? document.order : 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const customFields = Object.entries(document)
    .filter(([key]) => !['id', 'title', 'content', 'documentContainerId', 'order', 'createdAt', 'updatedAt'].includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return { ...newDocument, ...customFields };
};

export const processDocumentAddition = (
  documentInput: AddDocumentInput,
  state: {
    documents: Document[],
    relationConfigs: RelationConfig[],
    relations: DocumentRelation[]
  }
) => {
  if (!documentInput.title) {
    throw Errors.DOCUMENT_TITLE_REQUIRED();
  }

  if (!documentInput.documentContainerId) {
    throw Errors.DOCUMENT_CONTAINER_REQUIRED();
  }

  const newDocument = createDocument(documentInput);
  const { documents, relationConfigs, relations } = state;
  
  const updatedDocuments = [...documents, newDocument];
  const newRelations = autoCreateRelations(
    newDocument,
    updatedDocuments,
    relationConfigs,
    relations
  );

  return {
    documents: updatedDocuments,
    relations: [...relations, ...newRelations]
  };
};

export const processDocumentUpdate = (
  documentId: string,
  updates: Partial<Document>,
  state: {
    documents: Document[],
    relationConfigs: RelationConfig[],
    relations: DocumentRelation[]
  }
) => {
  const { documents, relationConfigs, relations } = state;
  
  const updatedDocuments = documents.map(doc =>
    doc.id === documentId
      ? { ...doc, ...updates, updatedAt: new Date() }
      : doc
  );

  const updatedDoc = updatedDocuments.find(doc => doc.id === documentId);
  if (!updatedDoc) {
    throw Errors.DOCUMENT_NOT_FOUND();
  }

  const newRelations = autoCreateRelations(
    updatedDoc,
    updatedDocuments,
    relationConfigs,
    relations
  );

  return {
    documents: updatedDocuments,
    relations: [...relations, ...newRelations]
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