// src/utils/documents/autoRelationUtils.ts
import { Document } from "@/types/document";
import { DocumentRelation, RelationConfig, MatchType } from "@/types/relation";
import { createRelation } from "./relationUtils";

const compareValues = (
  sourceValue: unknown,
  targetValue: unknown,
  matchType: MatchType
): boolean => {
  // Handle null/undefined values
  if (sourceValue === null || sourceValue === undefined || 
      targetValue === null || targetValue === undefined) {
    return false;
  }

  // Convert values to strings and normalize
  const s = String(sourceValue).toLowerCase().trim();
  const t = String(targetValue).toLowerCase().trim();
  
  // Handle empty strings
  if (!s || !t) {
    return false;
  }
  
  switch (matchType) {
    case "exact":
      return s === t;
    case "contains":
      return s.includes(t) || t.includes(s);
    case "startsWith":
      return s.startsWith(t) || t.startsWith(s);
    case "endsWith":
      return s.endsWith(t) || t.endsWith(s);
    default:
      return false;
  }
};

export const autoCreateRelations = (
  updatedDocument: Document,
  allDocuments: Document[],
  relationConfigs: RelationConfig[],
  existingRelations: DocumentRelation[]
): DocumentRelation[] => {
  const newRelations: DocumentRelation[] = [];

  // Get relevant configs for this document's container
  const relevantConfigs = relationConfigs.filter(config => 
    config.sourceContainerId === updatedDocument.documentContainerId ||
    config.targetContainerId === updatedDocument.documentContainerId
  );

  relevantConfigs.forEach(config => {
    // Document as source
    if (updatedDocument.documentContainerId === config.sourceContainerId) {
      const targetDocs = allDocuments.filter(
        doc => doc.documentContainerId === config.targetContainerId && 
              doc.id !== updatedDocument.id
      );

      targetDocs.forEach(targetDoc => {
        // Check if all rules match
        const matches = config.rules.every(rule => {
          const sourceVal = updatedDocument[rule.sourceField];
          const targetVal = targetDoc[rule.targetField];
          return compareValues(sourceVal, targetVal, rule.matchType);
        });

        // Check if relation already exists
        const relationExists = existingRelations.some(
          rel =>
            rel.configId === config.id &&
            rel.sourceDocumentId === updatedDocument.id &&
            rel.targetDocumentId === targetDoc.id
        );

        if (matches && !relationExists) {
          newRelations.push(
            createRelation(
              updatedDocument.id,
              targetDoc.id,
              config.id,
              updatedDocument,
              targetDoc
            )
          );
        }
      });
    }

    // Document as target
    if (updatedDocument.documentContainerId === config.targetContainerId) {
      const sourceDocs = allDocuments.filter(
        doc => doc.documentContainerId === config.sourceContainerId && 
              doc.id !== updatedDocument.id
      );

      sourceDocs.forEach(sourceDoc => {
        // Check if all rules match
        const matches = config.rules.every(rule => {
          const sourceVal = sourceDoc[rule.sourceField];
          const targetVal = updatedDocument[rule.targetField];
          return compareValues(sourceVal, targetVal, rule.matchType);
        });

        // Check if relation already exists
        const relationExists = existingRelations.some(
          rel =>
            rel.configId === config.id &&
            rel.sourceDocumentId === sourceDoc.id &&
            rel.targetDocumentId === updatedDocument.id
        );

        if (matches && !relationExists) {
          newRelations.push(
            createRelation(
              sourceDoc.id,
              updatedDocument.id,
              config.id,
              sourceDoc,
              updatedDocument
            )
          );
        }
      });
    }
  });

  return newRelations;
};