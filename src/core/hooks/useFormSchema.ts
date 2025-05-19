// src/core/hooks/useFormSchema.ts - wymiana na Formik (uproszczona)
import { useMemo } from 'react';
import { ZodType } from 'zod';

const SIMPLE_VALUE_FIELD = 'value';

// Pomocnicze funkcje dla prostych typów
export function wrapSimpleValue(value: any): Record<string, any> {
  return { [SIMPLE_VALUE_FIELD]: value };
}

export function unwrapSimpleValue(data: Record<string, any>): any {
  if (data && typeof data === 'object' && SIMPLE_VALUE_FIELD in data) {
    return data[SIMPLE_VALUE_FIELD];
  }
  return data;
}

// Sprawdza czy schemat to prosty typ
export function isSimpleTypeSchema(schema: any): boolean {
  return schema && 
    typeof schema === 'object' && 
    (schema.type === 'string' || schema.type === 'number' || 
     schema.type === 'integer' || schema.type === 'boolean');
}

// Funkcja mapująca typy JSON na typy pól formularza
export function mapJsonTypeToFieldType(schema: any): string {
  // Priorytet dla niestandardowego widgetu UI
  if (schema.uiWidget) return schema.uiWidget;
  
  // Sprawdź format
  if (schema.format) {
    if (['textarea', 'date', 'email', 'password'].includes(schema.format)) {
      return schema.format;
    }
  }
  
  // Sprawdź enum
  if (schema.enum && schema.enum.length > 0) return "select";
  
  // Użyj typu
  switch (schema.type) {
    case "boolean": return "checkbox";
    case "number":
    case "integer": return "number";
    case "array": return schema.items?.type === "string" ? "tags" : "select";
    case "string": return schema.maxLength && schema.maxLength > 100 ? "textarea" : "text";
    default: return "text";
  }
}

// Generuje schematy pól z JSON schema
export function generateFieldSchemas(jsonSchema: any, isSimpleType: boolean) {
  if (!jsonSchema) return {};
  
  const schemas: Record<string, any> = {};
  
  // Obsługa prostych typów
  if (isSimpleType) {
    schemas[SIMPLE_VALUE_FIELD] = {
      type: jsonSchema.type || "string",
      title: jsonSchema.title || "Wartość",
      description: jsonSchema.description,
      required: jsonSchema.required === true,
      fieldType: mapJsonTypeToFieldType(jsonSchema),
      min: jsonSchema.minimum,
      max: jsonSchema.maximum,
      step: jsonSchema.multipleOf,
      placeholder: jsonSchema.example,
      ...extractUiMetadata(jsonSchema)
    };
    
    // Obsługa enumeracji
    if (jsonSchema.enum && jsonSchema.enum.length > 0) {
      schemas[SIMPLE_VALUE_FIELD].options = jsonSchema.enum.map(
        (value: any, index: number) => ({
          value,
          label: jsonSchema.enumNames?.[index] || String(value),
        })
      );
    }
    
    return schemas;
  }
  
  // Obsługa obiektów
  if (jsonSchema.properties) {
    const requiredFields = jsonSchema.required || [];
    
    Object.entries(jsonSchema.properties).forEach(
      ([field, propSchema]: [string, any]) => {
        const isRequired = requiredFields.includes(field);
        const fieldType = mapJsonTypeToFieldType(propSchema);
        const uiMetadata = extractUiMetadata(propSchema);
        
        schemas[field] = {
          type: propSchema.type || "string",
          title: propSchema.title || field,
          description: propSchema.description,
          required: isRequired,
          fieldType,
          min: propSchema.minimum,
          max: propSchema.maximum,
          step: propSchema.multipleOf,
          placeholder: uiMetadata.uiPlaceholder || propSchema.example,
          ...uiMetadata
        };
        
        if (propSchema.enum && propSchema.enum.length > 0) {
          schemas[field].options = propSchema.enum.map(
            (value: any, index: number) => ({
              value,
              label: propSchema.enumNames?.[index] || String(value),
            })
          );
        }
      }
    );
  }
  
  return schemas;
}

// Ekstrahuje metadane UI z JSON Schema
function extractUiMetadata(propSchema: any): Record<string, any> {
  const uiMetadata: Record<string, any> = {};
  
  Object.entries(propSchema).forEach(([key, value]) => {
    if (key.startsWith('ui:')) {
      const uiKey = key.replace('ui:', 'ui');
      uiMetadata[uiKey] = value;
    }
  });
  
  if (propSchema.example && !uiMetadata.uiPlaceholder) {
    uiMetadata.uiPlaceholder = propSchema.example;
  }
  
  return uiMetadata;
}

// Funkcja do tworzenia walidatorów Formik z JSON Schema
export function createValidator(jsonSchema: any, isSimpleType: boolean) {
  return (values: any) => {
    const errors: Record<string, string> = {};
    
    if (isSimpleType) {
      const value = values[SIMPLE_VALUE_FIELD];
      if (jsonSchema.required && (value === undefined || value === null || value === '')) {
        errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
      }
      return errors;
    }
    
    // Obsługa obiektów
    if (jsonSchema.properties) {
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
  };
}

// Główny hook - zastąpiony przez useFormik
export function useFormSchema<T>({
  schema,
  jsonSchema,
  initialData,
}: {
  schema: ZodType<T>;
  jsonSchema?: any;
  initialData?: T;
}) {
  const isSimpleType = useMemo(() => isSimpleTypeSchema(jsonSchema), [jsonSchema]);
  
  const processedInitialData = useMemo(() => {
    if (isSimpleType && initialData !== undefined && 
        (typeof initialData !== 'object' || initialData === null)) {
      return wrapSimpleValue(initialData);
    }
    return initialData;
  }, [isSimpleType, initialData]);
  
  const fieldSchemas = useMemo(() => 
    generateFieldSchemas(jsonSchema, isSimpleType),
    [jsonSchema, isSimpleType]
  );
  
  const hasRequiredFields = useMemo(
    () => Object.values(fieldSchemas).some((schema: any) => schema.required),
    [fieldSchemas]
  );
  
  const validator = useMemo(() => 
    createValidator(jsonSchema, isSimpleType),
    [jsonSchema, isSimpleType]
  );
  
  return {
    initialValues: processedInitialData || {},
    fieldSchemas,
    hasRequiredFields,
    isSimpleType,
    unwrapSimpleValue,
    validator
  };
}