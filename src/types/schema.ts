// types/schema.ts
export type SchemaFieldType = 'text' | 'number' | 'date' | 'boolean' | 'select';

export interface SchemaValidation {
  required?: boolean;
  options?: string[];
}

export interface SchemaField {
  key: string;
  name: string;
  type: SchemaFieldType;
  validation?: SchemaValidation;
  atList?: boolean;
}

export interface DocumentSchema {
  id: string;
  fields: SchemaField[];
}
