// src/utils/documents/documentUtils.ts

import { 
  Document, 
  CustomFieldValue, 
  DocumentContainer, 
  AddDocumentInput, 
  AddContainerInput 
} from "@/types/document";
import { DocumentSchema, SchemaField } from "@/types/schema";
import { RelationConfig, DocumentRelation } from "@/types/relation";
import { validateField } from "./validation";

/* ================= Dokumenty ================= */

/**
 * Inicjalizuje dokument, uwzględniając schemat – dla pól nieustawionych przypisuje domyślne wartości.
 */
export const initializeDocument = (
  baseDocument: Partial<Document>,
  schema?: DocumentSchema
): Document => {
  const document = { ...baseDocument } as Document & { [key: string]: CustomFieldValue };

  if (schema?.fields) {
    schema.fields.forEach((field) => {
      if (document[field.key] === undefined) {
        document[field.key] = getFieldDefaultValue(field);
      }
    });
  }

  return document as Document;
};

/**
 * Zwraca domyślną wartość dla pola na podstawie jego typu.
 */
export const getFieldDefaultValue = (field: SchemaField): CustomFieldValue => {
  switch (field.type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "date":
      return new Date();
    case "select":
      return field.validation?.options?.[0] || "";
    default:
      return "";
  }
};

/**
 * Aktualizuje wartość pola dokumentu, uwzględniając walidację według schematu.
 */
export const updateDocumentFieldValue = (
  document: Document,
  field: string,
  value: CustomFieldValue,
  schema?: DocumentSchema
): { isValid: boolean; document: Document; error?: string } => {
  const schemaField = schema?.fields.find(f => f.key === field);
  const docWithCustomFields = document as Document & { [key: string]: CustomFieldValue };

  if (!schemaField) {
    return {
      isValid: true,
      document: { ...document, [field]: value },
    };
  }

  const isValid = validateField(value, schemaField);
  return {
    isValid,
    document: isValid 
      ? { ...docWithCustomFields, [field]: value } 
      : document,
    error: isValid ? undefined : `Invalid value for field ${field}`,
  };
};

/**
 * Tworzy nowy dokument na podstawie danych wejściowych.
 */
export const createDocument = (document: AddDocumentInput): Document => {
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

  // Dodajemy pola niestandardowe (custom fields)
  const customFields = Object.entries(document)
    .filter(([key]) => !['id', 'title', 'content', 'documentContainerId', 'order', 'createdAt', 'updatedAt'].includes(key))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

  return { ...newDocument, ...customFields };
};

/* ================= Kontenery ================= */

/**
 * Sprawdza, czy nazwa kontenera jest unikalna (pomijając ewentualnie kontener o podanym id).
 */
export const isContainerNameUnique = (
  containers: DocumentContainer[],
  name: string,
  excludeId?: string
): boolean => {
  return !containers.some(
    container => container.id !== excludeId && container.name.toLowerCase() === name.toLowerCase()
  );
};

/**
 * Tworzy nowy kontener dokumentów.
 */
export const createContainer = (container: AddContainerInput): DocumentContainer => {
  return {
    ...container,
    id: Date.now().toString(),
    createdAt: new Date(),
  };
};

/**
 * Sprawdza, czy możliwe jest usunięcie kontenera (tj. nie posiada powiązań z relacjami).
 */
export const canDeleteContainer = (
  containerId: string,
  relations: DocumentRelation[]
): boolean => {
  return !relations.some(
    rel => rel.sourceContainerId === containerId || rel.targetContainerId === containerId
  );
};

/* ================= Relacje ================= */

/**
 * Waliduje relację między dokumentami według konfiguracji.
 */
export const isRelationValid = (
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

/**
 * Tworzy nową relację między dokumentami.
 */
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

/* ================= Inne ================= */

/**
 * Filtrowanie dokumentów według id kontenera oraz sortowanie według porządku.
 */
export const filterDocumentsByContainer = (
  documents: Document[],
  documentContainerId: string
): Document[] => {
  return documents
    .filter(doc => doc.documentContainerId === documentContainerId)
    .sort((a, b) => a.order - b.order);
};

/**
 * Pobiera powiązane dokumenty dla zadanego dokumentu (opcjonalnie z określonym kontenerem docelowym).
 */
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

/**
 * Pobiera dostępne konfiguracje relacji dla danego kontenera.
 */
export const getAvailableRelationConfigs = (
  sourceContainerId: string,
  relationConfigs: RelationConfig[]
): RelationConfig[] => {
  return relationConfigs.filter(
    config => config.sourceContainerId === sourceContainerId
  );
};
