// src/core/hooks/useFormSchema.ts
import { useMemo } from "react";
import { ZodType } from "zod";
import { useForm } from ".";

interface FieldSchema {
  isArray?: boolean;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  options?: Array<{ value: any; label: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  fieldType:
    | "text"
    | "number"
    | "checkbox"
    | "select"
    | "textarea"
    | "date"
    | "email"
    | "password"
    | "tags"; // Dodany typ dla pól z tagami
  // Dodatkowe atrybuty UI
  uiWidget?: string;
  uiPlaceholder?: string;
  uiHelp?: string;
  uiOrder?: number;
  uiDisabled?: boolean;
  uiHidden?: boolean;
  uiClassName?: string;
}

interface UseFormSchemaOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  initialData?: T;
}

interface UseFormSchemaResult {
  formData: Record<string, any>;
  errors: Record<string, string>;
  handleChange: (field: string, value: any) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  fieldSchemas: Record<string, FieldSchema>;
  hasRequiredFields: boolean;
  isSimpleType: boolean;
  unwrapSimpleValue: (data: any) => any;
  setErrors: (errors: Record<string, string>) => void;
}

// Funkcja pomocnicza do mapowania typów JSON na typy pól formularza
function mapJsonTypeToFieldType(
  schema: any
):
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "date"
  | "email"
  | "password"
  | "tags" {
  // Priorytet dla niestandardowego widgetu UI, jeśli istnieje
  if (schema.uiWidget) {
    switch (schema.uiWidget) {
      case "textarea": return "textarea";
      case "date": return "date";
      case "email": return "email";
      case "password": return "password";
      case "select": return "select";
      case "checkbox": return "checkbox";
      case "tags": return "tags";
      default: return "text";
    }
  }
  
  // Następnie sprawdź format, jeśli istnieje
  if (schema.format) {
    switch (schema.format) {
      case "textarea": return "textarea";
      case "date": return "date";
      case "email": return "email";
      case "password": return "password";
      default: break;
    }
  }
  
  // Sprawdź, czy mamy do czynienia z enumem
  if (schema.enum && schema.enum.length > 0) return "select";
  
  // W przeciwnym razie użyj typu
  switch (schema.type) {
    case "boolean": return "checkbox";
    case "number":
    case "integer": return "number";
    case "array": 
      return schema.items?.type === "string" ? "tags" : "select";
    case "string": 
      return schema.maxLength && schema.maxLength > 100 ? "textarea" : "text";
    default: return "text";
  }
}

// Funkcja sprawdzająca czy schemat to prosty typ
function isSimpleTypeSchema(schema: any): boolean {
  return schema && 
    typeof schema === 'object' && 
    (schema.type === 'string' || schema.type === 'number' || 
     schema.type === 'integer' || schema.type === 'boolean');
}

// Pole, które jest używane do przechowywania prostych wartości
const SIMPLE_VALUE_FIELD = 'value';

// Funkcja do zawijania prostych wartości w obiekt
export function wrapSimpleValue(value: any): Record<string, any> {
  return { [SIMPLE_VALUE_FIELD]: value };
}

// Funkcja do odwijania prostych wartości z obiektu
export function unwrapSimpleValue(data: Record<string, any>): any {
  if (data && typeof data === 'object' && SIMPLE_VALUE_FIELD in data) {
    return data[SIMPLE_VALUE_FIELD];
  }
  return data;
}

// Funkcja walidująca dane dla prostych typów
export function validateSimpleValue(
  data: Record<string, any>,
  jsonSchema: any
): Record<string, string> {
  const errors: Record<string, string> = {};
  
  if (!jsonSchema || !data) return errors;
  
  const value = data[SIMPLE_VALUE_FIELD];
  
  // Walidacja dla string
  if (jsonSchema.type === 'string') {
    if (jsonSchema.required && (!value || value.trim() === '')) {
      errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
    } else if (value) {
      if (jsonSchema.minLength && value.length < jsonSchema.minLength) {
        errors[SIMPLE_VALUE_FIELD] = `Minimum ${jsonSchema.minLength} znaków`;
      }
      
      if (jsonSchema.maxLength && value.length > jsonSchema.maxLength) {
        errors[SIMPLE_VALUE_FIELD] = `Maksimum ${jsonSchema.maxLength} znaków`;
      }
      
      if (jsonSchema.pattern) {
        const regex = new RegExp(jsonSchema.pattern);
        if (!regex.test(value)) {
          errors[SIMPLE_VALUE_FIELD] = jsonSchema.patternMessage || "Nieprawidłowy format";
        }
      }
    }
  }
  
  // Walidacja dla number
  if (jsonSchema.type === 'number' || jsonSchema.type === 'integer') {
    if (jsonSchema.required && (value === undefined || value === null || value === '')) {
      errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
    } else if (value !== undefined && value !== null && value !== '') {
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        errors[SIMPLE_VALUE_FIELD] = "Wartość musi być liczbą";
      } else {
        if (jsonSchema.minimum !== undefined && numValue < jsonSchema.minimum) {
          errors[SIMPLE_VALUE_FIELD] = `Minimalna wartość to ${jsonSchema.minimum}`;
        }
        
        if (jsonSchema.maximum !== undefined && numValue > jsonSchema.maximum) {
          errors[SIMPLE_VALUE_FIELD] = `Maksymalna wartość to ${jsonSchema.maximum}`;
        }
        
        if (jsonSchema.type === 'integer' && !Number.isInteger(numValue)) {
          errors[SIMPLE_VALUE_FIELD] = "Wartość musi być liczbą całkowitą";
        }
      }
    }
  }
  
  // Walidacja dla boolean
  if (jsonSchema.type === 'boolean' && jsonSchema.required) {
    if (value !== true) {
      errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
    }
  }
  
  return errors;
}

// Ekstrahowanie metadanych UI z JSON Schema
function extractUiMetadata(propSchema: any): Partial<FieldSchema> {
  const uiMetadata: Partial<FieldSchema> = {};
  
  // Obsługa standardowych metadanych UI z przestrzeni 'ui:'
  Object.entries(propSchema).forEach(([key, value]) => {
    if (key.startsWith('ui:')) {
      const uiKey = key.replace('ui:', 'ui');
      // @ts-ignore - dynamiczne przypisanie
      uiMetadata[uiKey] = value;
    }
  });
  
  // Dodaj placeholder z przykładu, jeśli nie ma uiPlaceholder
  if (propSchema.example && !uiMetadata.uiPlaceholder) {
    uiMetadata.uiPlaceholder = propSchema.example;
  }
  
  return uiMetadata;
}

export const useFormSchema = <T>({
  schema,
  jsonSchema,
  initialData,
}: UseFormSchemaOptions<T>): UseFormSchemaResult => {
  // Sprawdź, czy mamy do czynienia z prostym typem
  const isSimpleType = useMemo(() => isSimpleTypeSchema(jsonSchema), [jsonSchema]);
  
  // Przygotuj dane początkowe - zawijamy proste wartości w obiekt z polem "value"
  const processedInitialData = useMemo(() => {
    if (isSimpleType && initialData !== undefined && 
        (typeof initialData !== 'object' || initialData === null)) {
      return wrapSimpleValue(initialData);
    }
    return initialData;
  }, [isSimpleType, initialData]);
  
  const formHook = useForm<T>({ 
    schema, 
    jsonSchema, 
    initialData: processedInitialData as T 
  });

  const { errors, setErrors } = formHook;

  // Przygotuj schemat pól formularza
  const fieldSchemas = useMemo(() => {
    const schemas: Record<string, FieldSchema> = {};
    
    // Obsługa prostych typów (string, number, boolean)
    if (isSimpleType) {
      const fieldType = mapJsonTypeToFieldType(jsonSchema);
      const uiMetadata = extractUiMetadata(jsonSchema);
      
      schemas[SIMPLE_VALUE_FIELD] = {
        type: jsonSchema.type || "string",
        title: jsonSchema.title || "Wartość",
        description: jsonSchema.description,
        required: jsonSchema.required === true,
        fieldType,
        min: jsonSchema.minimum,
        max: jsonSchema.maximum,
        step: jsonSchema.multipleOf,
        placeholder: uiMetadata.uiPlaceholder || jsonSchema.example,
        ...uiMetadata
      };
      
      // Obsługa enumeracji dla prostych typów
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
    
    // Istniejąca logika dla obiektów
    if (jsonSchema && jsonSchema.properties) {
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
  }, [jsonSchema, isSimpleType]);

  const hasRequiredFields = useMemo(
    () => Object.values(fieldSchemas).some((schema) => schema.required),
    [fieldSchemas]
  );
  
  // Zmodyfikowana funkcja walidacji formularza
  const validateForm = () => {
    // Jeśli mamy prosty typ, wykonujemy własną walidację
    if (isSimpleType) {
      const simpleErrors = validateSimpleValue(formHook.formData, jsonSchema);
      
      // Ustawienie błędów walidacji (jeśli istnieją)
      if (Object.keys(simpleErrors).length > 0) {
        setErrors(simpleErrors);
        return false;
      }
      
      return true;
    }
    
    // Dla złożonych obiektów używamy standardowej walidacji
    return formHook.validateForm();
  };

  return { 
    ...formHook, 
    fieldSchemas, 
    hasRequiredFields,
    isSimpleType,
    unwrapSimpleValue,
    validateForm, // Nadpisujemy oryginalną metodę
    setErrors, // Eksportujemy metodę do ustawiania błędów
  };
};