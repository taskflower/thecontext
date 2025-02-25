// src/hooks/useDocumentFiltering.ts
import { useState, useMemo } from 'react';
import { Document } from '@/types/document';
import { DocumentRelation } from '@/types/relation';

interface UseDocumentFilteringProps {
  documents: Document[];
  initialSearchFields?: string[];
  initialFilter?: string;
  relationFilter?: string | null;
  relations?: DocumentRelation[];
}

interface UseDocumentFilteringResult {
  filter: string;
  setFilter: (value: string) => void;
  searchFields: string[];
  setSearchFields: (fields: string[]) => void;
  filteredDocuments: Document[];
}

export const useDocumentFiltering = ({
  documents,
  initialSearchFields = ['title', 'content'],
  initialFilter = "",
  relationFilter = null,
  relations = [],
}: UseDocumentFilteringProps): UseDocumentFilteringResult => {
  // Stan dla filtra tekstowego
  const [filter, setFilter] = useState(initialFilter);
  const [searchFields, setSearchFields] = useState<string[]>(initialSearchFields);

  const filteredDocuments = useMemo(() => {
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

  return {
    filter,
    setFilter,
    searchFields,
    setSearchFields,
    filteredDocuments,
  };
};
