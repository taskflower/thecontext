// src/core/hooks/useFormSchema.ts
import { useState, useMemo, useCallback } from "react";
import { ZodType } from "zod";
import { useFlow } from "../context";

const SIMPLE_VALUE_FIELD = "value";

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
  if (data && typeof data === "object" && SIMPLE_VALUE_FIELD in data) {
    return data[SIMPLE_VALUE_FIELD];
  }
  return data;
}

// Helpers które były dostępne w starej wersji
export function mapJsonTypeToFieldType(schema: any): string {
  return schema.widget || schema.type || "text";
}

export function isSimpleTypeSchema(schema: any): boolean {
  return (
    schema &&
    typeof schema === "object" &&
    (schema.type === "string" ||
      schema.type === "number" ||
      schema.type === "integer" ||
      schema.type === "boolean")
  );
}

export function extractUiMetadata(propSchema: any): Record<string, any> {
  return propSchema;
}

export function generateFieldSchemas(jsonSchema: any, isSimpleType: boolean) {
  if (!jsonSchema) return {};

  const schemas: Record<string, any> = {};
  if (isSimpleType) {
    schemas[SIMPLE_VALUE_FIELD] = {
      ...jsonSchema,
      type: jsonSchema.type || "text",
      ...(jsonSchema.fieldType ? { fieldType: jsonSchema.fieldType } : {}),
      title: jsonSchema.title || "Wartość",
    };

    return schemas;
  }

  if (jsonSchema.properties) {
    // Pobierz tablicę wymaganych pól z poziomu obiektu (standardowa specyfikacja JSON Schema)
    const requiredFields = jsonSchema.required || [];

    Object.entries(jsonSchema.properties).forEach(
      ([field, propSchema]: [string, any]) => {
        // Sprawdź czy pole ma własny atrybut required (niestandardowa implementacja)
        const isFieldRequired = 
          requiredFields.includes(field) || propSchema.required === true;

        schemas[field] = {
          ...propSchema,
          type: propSchema.type || "text",
          required: isFieldRequired,
          title: propSchema.title || field,
        };
      }
    );
  }

  return schemas;
}

export function validateWithJsonSchema(
  values: any,
  jsonSchema: any,
  isSimpleType: boolean
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!values || !jsonSchema) return errors;

  if (isSimpleType) {
    const value = values[SIMPLE_VALUE_FIELD];
    if (
      jsonSchema.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors[SIMPLE_VALUE_FIELD] = "To pole jest wymagane";
    }
    return errors;
  }

  if (jsonSchema.properties && jsonSchema.required) {
    jsonSchema.required.forEach((field: string) => {
      const propSchema = jsonSchema.properties[field];
      if (!propSchema) return;

      const value = values[field];

      if (propSchema.type === "boolean") {
        // Boolean jest wymagany tylko wtedy, gdy ma być true
        if (value !== true) {
          errors[field] = "To pole jest wymagane";
        }
      } else if (value === undefined || value === null || value === "") {
        errors[field] = "To pole jest wymagane";
      }
    });
  }

  return errors;
}

// Eksportujmy createValidator dla zachowania kompatybilności wstecznej
export function createValidator(jsonSchema: any, isSimpleType: boolean) {
  return (values: any) =>
    validateWithJsonSchema(values, jsonSchema, isSimpleType);
}

// Główny hook
export function useFormSchema<T>({
  jsonSchema,
  initialData,
  autoValidate = false,
  contextDataPath,
}: FormSchemaOptions<T>): FormSchemaResult<T> {
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [localData, setLocalData] = useState<T | null>(null);

  const isSimpleType = useMemo(
    () => isSimpleTypeSchema(jsonSchema),
    [jsonSchema]
  );

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
    if (
      isSimpleType &&
      data !== undefined &&
      (typeof data !== "object" || data === null)
    ) {
      return wrapSimpleValue(data);
    }
    return data;
  }, [isSimpleType, data]);

  // Generuj schematy pól
  const fieldSchemas = useMemo(
    () => generateFieldSchemas(jsonSchema, isSimpleType),
    [jsonSchema, isSimpleType]
  );

  // Sprawdź czy są wymagane pola
  const hasRequiredFields = useMemo(
    () => jsonSchema && jsonSchema.required && jsonSchema.required.length > 0,
    [jsonSchema]
  );

  // Funkcja walidacji - zwraca true jeśli nie ma błędów, false jeśli są błędy
  const validate = useCallback(() => {
    if (!jsonSchema || !processedData) return true;

    setIsLoading(true);
    const validationErrors = validateWithJsonSchema(
      processedData,
      jsonSchema,
      isSimpleType
    );
    setErrors(validationErrors);
    setIsLoading(false);

    return Object.keys(validationErrors).length === 0;
  }, [processedData, jsonSchema, isSimpleType]);

  // Funkcja aktualizująca dane
  const setData = useCallback(
    (newData: T) => {
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
    },
    [jsonSchema, isSimpleType, autoValidate]
  );

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
    processedData,
  };
}
