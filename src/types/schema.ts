// src/types/schema.ts
export type SchemaFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface SchemaFieldValidation {
  required?: boolean;
  options?: string[];
}

export interface SchemaField {
  key: string;
  name: string;
  type: SchemaFieldType;
  validation?: SchemaFieldValidation;
}

export interface DocumentSchema {
  id: string;
  fields: SchemaField[];
}