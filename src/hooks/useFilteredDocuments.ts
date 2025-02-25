// src/hooks/useFilteredDocuments.ts
import { useMemo } from 'react';
import { Document } from '@/types/document';
import { DocumentRelation } from '@/types/relation';

interface UseFilteredDocumentsProps {
  documents: Document[];
  filter: string;
  searchFields?: string[];
  relationFilter?: string | null;
  relations?: DocumentRelation[];
}

export const useFilteredDocuments = ({
  documents,
  filter,
  searchFields = ['title', 'content'],
  relationFilter,
  relations = [],
}: UseFilteredDocumentsProps): Document[] => {
  return useMemo(() => {
    let filteredDocs = documents;

    if (filter) {
      const searchTerm = filter.toLowerCase();
      filteredDocs = filteredDocs.filter(doc =>
        searchFields.some(field => {
          const value = doc[field];
          return value && String(value).toLowerCase().includes(searchTerm);
        })
      );
    }

    if (relationFilter && relations.length) {
      filteredDocs = filteredDocs.filter(doc => {
        const matchingRelation = relations.find(rel =>
          rel.configId === relationFilter &&
          (rel.sourceDocumentId === doc.id || rel.targetDocumentId === doc.id)
        );
        return !!matchingRelation;
      });
    }

    return filteredDocs;
  }, [documents, filter, searchFields, relationFilter, relations]);
};
