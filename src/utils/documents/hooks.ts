/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/customFields/hooks.ts
import { useCallback, useState, useMemo } from 'react';
import { SchemaField } from "@/types/schema";
import { CustomFieldValue } from '@/types/document';
import { validateField } from './validation';

export const useCustomFields = (schema: SchemaField[]) => {
  const updateField = useCallback((
    document: Document,
    key: string, 
    value: CustomFieldValue
  ): Document | null => {

    const field = schema.find(f => f.key === key);
    if (!field || !validateField(value, field)) return null;
    
    return {
      ...document,
      [key]: value
    };
  }, [schema]);

  return {
    updateField,
    validateField: (key: string, value: unknown) => {
      const field = schema.find(f => f.key === key);
      return field ? validateField(value, field) : false;
    }
  };
}

interface FilterableDocument {
  title: string;
  content: string;
  [key: string]: any;
}

export const useDocumentFilter = <T extends FilterableDocument>(documents: T[]) => {
  const [filter, setFilter] = useState("");
  
  const filteredDocuments = useMemo(() => {
    return documents.filter(
      (doc) =>
        doc.title.toLowerCase().includes(filter.toLowerCase()) ||
        doc.content.toLowerCase().includes(filter.toLowerCase())
    );
  }, [documents, filter]);

  return { filter, setFilter, filteredDocuments };
};