import { SchemaField } from "@/types/schema";

// validation.ts
export const validateField = (value: unknown, field: SchemaField): boolean => {
  if (field.validation?.required && !value) return false;

  switch (field.type) {
    case 'number': return typeof value === 'number';
    case 'date': return value instanceof Date;
    case 'boolean': return typeof value === 'boolean';
    case 'select': return field.validation?.options?.includes(value as string) ?? false;
    default: return true;
  }
}