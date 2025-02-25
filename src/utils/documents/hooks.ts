/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { SchemaField } from "@/types/schema";
import { Document, CustomFieldValue } from '@/types/document';
import { validateField } from './validation';
import { Errors } from '../errors';

interface UseCustomFieldsResult {
  updateField: (document: Document, key: string, value: CustomFieldValue) => Document | null;
  validateField: (key: string, value: unknown) => boolean;
}

export const useCustomFields = (schema: SchemaField[]): UseCustomFieldsResult => {
  const updateField = useCallback((
    document: Document,
    key: string, 
    value: CustomFieldValue
  ): Document | null => {
    const field = schema.find(f => f.key === key);
    if (!field) {
      throw Errors.INVALID_RELATION(`Field ${key} not found in schema`);
    }

    if (!validateField(value, field)) {
      return null;
    }
    
    return {
      ...document,
      [key]: value,
      updatedAt: new Date()
    };
  }, [schema]);

  const fieldValidator = useCallback((key: string, value: unknown): boolean => {
    const field = schema.find(f => f.key === key);
    return field ? validateField(value, field) : false;
  }, [schema]);

  return {
    updateField,
    validateField: fieldValidator
  };
};
