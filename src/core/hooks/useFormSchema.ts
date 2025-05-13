// src/core/hooks/useFormSchema.ts
import { useMemo, useCallback } from "react";
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
    | "password";
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
}

// Funkcja pomocnicza do mapowania typów JSON na typy pól formularza
function mapJsonTypeToFieldType(
  type?: string,
  format?: string,
  hasEnum?: any[]
):
  | "text"
  | "number"
  | "checkbox"
  | "select"
  | "textarea"
  | "date"
  | "email"
  | "password" {
  if (hasEnum && hasEnum.length > 0) return "select";
  if (type === "boolean") return "checkbox";
  if (type === "number" || type === "integer") return "number";
  if (type === "string") {
    if (format === "date") return "date";
    if (format === "email") return "email";
    if (format === "password") return "password";
    if (format === "textarea") return "textarea";
    return "text";
  }
  return "text";
}

export const useFormSchema = <T>({
  schema,
  jsonSchema,
  initialData,
}: UseFormSchemaOptions<T>): UseFormSchemaResult => {
  const formHook = useForm<T>({ schema, jsonSchema, initialData });

  const fieldSchemas = useMemo(() => {
    const schemas: Record<string, FieldSchema> = {};
    
    if (jsonSchema && jsonSchema.properties) {
      const requiredFields = jsonSchema.required || [];
      
      Object.entries(jsonSchema.properties).forEach(
        ([field, propSchema]: [string, any]) => {
          const isRequired = requiredFields.includes(field);
          const fieldType = mapJsonTypeToFieldType(
            propSchema.type,
            propSchema.format,
            propSchema.enum
          );
          
          schemas[field] = {
            type: propSchema.type || "string",
            title: propSchema.title || field,
            description: propSchema.description,
            required: isRequired,
            fieldType,
            min: propSchema.minimum,
            max: propSchema.maximum,
            step: propSchema.multipleOf,
            placeholder: propSchema.example,
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
  }, [jsonSchema]);

  const hasRequiredFields = useMemo(
    () => Object.values(fieldSchemas).some((schema) => schema.required),
    [fieldSchemas]
  );

  return { ...formHook, fieldSchemas, hasRequiredFields };
};