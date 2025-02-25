// src/utils/documents/fieldUtils.ts
import { Document, CustomFieldValue } from "@/types/document";
import { DocumentSchema, SchemaField } from "@/types/schema";
import { validateField } from "./validation";

export interface UpdateDocumentResult {
  isValid: boolean;
  document: Document;
  error?: string;
}

export const updateDocumentFieldValue = (
  document: Document,
  fieldKey: string,
  value: CustomFieldValue,
  schema?: SchemaField[]
): UpdateDocumentResult => {
  if (schema) {
    const field = schema.find((f) => f.key === fieldKey);
    if (field && !validateField(value, field)) {
      return {
        isValid: false,
        document,
        error: `Invalid value for field ${field.name}`,
      };
    }
  }

  return {
    isValid: true,
    document: {
      ...document,
      [fieldKey]: value,
      updatedAt: new Date(),
    },
  };
};

export const getFieldDefaultValue = (field: SchemaField): CustomFieldValue => {
  switch (field.type) {
    case "number":
      return 0;
    case "boolean":
      return false;
    case "date":
      return new Date();
    case "select":
      return field.validation?.options?.[0] || "";
    default:
      return "";
  }
};

export const initializeDocument = (
  baseDocument: Partial<Document>,
  schema?: DocumentSchema
): Document => {
  const document = { ...baseDocument } as Document & {
    [key: string]: CustomFieldValue;
  };

  if (schema?.fields) {
    schema.fields.forEach((field) => {
      if (document[field.key] === undefined) {
        document[field.key] = getFieldDefaultValue(field);
      }
    });
  }

  return document as Document;
};