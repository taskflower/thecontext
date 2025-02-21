// src/utils/customFields/documentHelpers.ts
import { Document, CustomFieldValue } from "@/types/document";
import { DocumentSchema, SchemaField } from "@/types/schema";
import { validateField } from "./validation";

type DocumentWithCustomFields = Document & {
  [key: string]: CustomFieldValue;
};

export const initializeDocumentWithSchema = (
  baseDocument: Partial<Document>,
  schema?: DocumentSchema
): Document => {
  const document = { ...baseDocument } as DocumentWithCustomFields;

  if (schema?.fields) {
    schema.fields.forEach((field) => {
      if (document[field.key] === undefined) {
        document[field.key] = getDefaultValueForField(field);
      }
    });
  }

  return document as Document;
};

export const getDefaultValueForField = (field: SchemaField): CustomFieldValue => {
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

interface ValidationResult {
  isValid: boolean;
  document: Document;
  error?: string;
}

export const updateDocumentField = (
  document: Document,
  field: string,
  value: CustomFieldValue,
  schema?: DocumentSchema
): ValidationResult => {
  const schemaField = schema?.fields.find((f) => f.key === field);
  const documentWithCustomFields = document as DocumentWithCustomFields;

  if (!schemaField) {
    return {
      isValid: true,
      document: {
        ...document,
        [field]: value,
      } as Document,
    };
  }

  const isValid = validateField(value, schemaField);
  return {
    isValid,
    document: isValid 
      ? { ...documentWithCustomFields, [field]: value } as Document 
      : document,
    error: !isValid ? `Invalid value for field ${field}` : undefined,
  };
};