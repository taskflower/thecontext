// src/core/hooks/useFormSchema.ts - kompletnie bez mapowania
import { useState, useMemo, useCallback } from 'react';
import { ZodType } from 'zod';
import { useFlow } from '../context';

const SIMPLE_VALUE_FIELD = 'value';

// Interface dla opcji hooka
interface FormSchemaOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  initialData?: T;
  autoValidate?: boolean;
  contextSchemaPath?: string;
  contextDataPath?: string;
}

// Interface dla zwracanych wartości
interface FormSchemaResult<T> {
  data: T | null;
  isValid: boolean;
  errors: Record<string, string>;
  fieldSchemas: Record<string, any>;
  isSimpleType: boolean;
  isLoading: boolean;
  setData: (newData: T) => void;
  validate: () => boolean;
  hasRequiredFields: boolean;
  processedData: T | null;
}

// Funkcje pomocnicze
export function wrapSimpleValue(value: any): Record<string, any> {
  return { [SIMPLE_VALUE_FIELD]: value };
}

export function unwrapSimpleValue(data: Record<string, any>): any {
  if (data && typeof data === 'object' && SIMPLE_VALUE_FIELD in data) {
    return data[SIMPLE_VALUE_FIELD];
  }
  return data;
}

// Helpers które były dostępne w starej wersji
export function mapJsonTypeToFieldType(schema: any): string {
  // Ta funkcja jest dostępna dla wstecznej kompatybilności
  // W nowym podejściu używamy bezpośrednio widget lub type
  return schema.widget || schema.type || "text";
}

export function isSimpleTypeSchema(schema: any): boolean {
  return schema && 
    typeof schema === 'object' && 
    (schema.type === 'string' || schema.type === 'number' || 
     schema.type === 'integer' || schema.type === 'boolean');
}

export function extractUiMetadata(propSchema: any): Record<string, any> {
  // Funkcja zachowana dla kompatybilności wstecznej
  return propSchema;
}

// Generuje schematy pól z JSON schema - bez jakiegokolwiek mapowania
export function generateFieldSchemas(jsonSchema: any, isSimpleType: boolean) {
  if (!jsonSchema) return {};
  
  const schemas: Record<string, any> = {};
  
  // Obsługa prostych typów
  if (isSimpleType) {
    schemas[SIMPLE_VALUE_FIELD] = {
      ...jsonSchema,
      // Używamy nazwy komponentu bezpośrednio z pola widget lub type
      fieldType: jsonSchema.widget || jsonSchema.type || 'text',
      title: jsonSchema.title || 'Wartość'
    };
    
    return schemas;
  }
  
  // Obsługa obiektów
  if (jsonSchema.properties) {
    const requiredFields = jsonSchema.required || [];
    
    Object.entries(jsonSchema.properties).forEach(
      ([field, propSchema]: [string, any]) => {
        // Wszystkie właściwości ze schematu są przekazywane bezpośrednio
        schemas[field] = {
          ...propSchema,
          // Tylko dodajemy pole fieldType jeśli nie istnieje
          fieldType: propSchema.widget || propSchema.type || 'text',
          // Oraz flagę required na podstawie listy required
          required: requiredFields.includes(field),
          // Upewniamy się, że title istnieje
          title: propSchema.title || field
        };
      }
    );
  }
  
  return schemas;
}

// Funkcja walidująca dane na podstawie JSON Schema
export function validateWithJsonSchema(values: any, jsonSchema: any, isSimpleType: boolean): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (isSimpleType) {
    const value = values[SIMPLE_VALUE_FIELD];
    if (jsonSchema.required && (value === undefined || value === null || value === '')) {
      errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
    }
    return errors;
  }
  
  // Obsługa obiektów
  if (jsonSchema.properties && jsonSchema.required) {
    const requiredFields = jsonSchema.required || [];
    
    requiredFields.forEach((field: string) => {
      const value = values[field];
      const propSchema = jsonSchema.properties[field];
      
      if (propSchema.type === 'boolean') {
        if (value !== true) errors[field] = "To pole jest wymagane";
      } else if (value === undefined || value === null || value === '') {
        errors[field] = "To pole jest wymagane";
      }
    });
  }
  
  return errors;
}

// Eksportujmy createValidator dla zachowania kompatybilności wstecznej
export function createValidator(jsonSchema: any, isSimpleType: boolean) {
  return (values: any) => validateWithJsonSchema(values, jsonSchema, isSimpleType);
}

// Główny hook
export function useFormSchema<T>({
  schema,
  jsonSchema,
  initialData,
  autoValidate = false,
  contextSchemaPath,
  contextDataPath
}: FormSchemaOptions<T>): FormSchemaResult<T> {
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localData, setLocalData] = useState<T | null>(null);
  
  const isSimpleType = useMemo(() => isSimpleTypeSchema(jsonSchema), [jsonSchema]);
  
  const contextData = useMemo(() => {
    if (contextDataPath) {
      return get(contextDataPath);
    }
    return initialData || null;
  }, [initialData, contextDataPath, get]);
  
  // Używamy danych z kontekstu jeśli są dostępne, w przeciwnym razie używamy lokalnych
  const data = contextData || localData;
  
  // Przygotuj dane w formacie odpowiednim dla formularza (opakowanie prostych typów)
  const processedData = useMemo(() => {
    if (isSimpleType && data !== undefined && 
        (typeof data !== 'object' || data === null)) {
      return wrapSimpleValue(data);
    }
    return data;
  }, [isSimpleType, data]);
  
  // Generuj schematy pól
  const fieldSchemas = useMemo(() => 
    generateFieldSchemas(jsonSchema, isSimpleType),
    [jsonSchema, isSimpleType]
  );
  
  // Sprawdź czy są wymagane pola
  const hasRequiredFields = useMemo(
    () => Object.values(fieldSchemas).some((schema: any) => schema.required),
    [fieldSchemas]
  );
  
  // Funkcja walidacji
  const validate = useCallback(() => {
    if (!jsonSchema) return true;
    
    setIsLoading(true);
    const validationErrors = validateWithJsonSchema(processedData, jsonSchema, isSimpleType);
    setErrors(validationErrors);
    setIsLoading(false);
    
    return Object.keys(validationErrors).length === 0;
  }, [processedData, jsonSchema, isSimpleType]);
  
  // Funkcja aktualizująca dane
  const setData = useCallback((newData: T) => {
    setLocalData(newData);
    if (autoValidate) {
      // Automatyczna walidacja przy zmianie danych
      const validationErrors = validateWithJsonSchema(
        isSimpleType ? wrapSimpleValue(newData) : newData, 
        jsonSchema, 
        isSimpleType
      );
      setErrors(validationErrors);
    }
  }, [jsonSchema, isSimpleType, autoValidate]);
  
  return {
    data,
    isValid: Object.keys(errors).length === 0,
    errors,
    fieldSchemas,
    isSimpleType,
    isLoading,
    setData,
    validate,
    hasRequiredFields,
    processedData
  };
}