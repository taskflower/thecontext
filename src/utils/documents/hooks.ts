/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/customFields/hooks.ts
import { useCallback } from 'react';
import { SchemaField } from "@/types/schema";
import { validateField } from "./validation";
import { CustomFieldValue } from '@/types/document';

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