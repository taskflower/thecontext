// src/types/schema.ts
export interface DocumentSchema {
  id: string;
  name: string;
  description?: string;
  fields: SchemaField[];
}

export interface SchemaField {
  key: string;
  name: string;
  type: FieldType;
  description?: string;
  validation?: FieldValidation;
  displayOptions?: {
    showInList?: boolean;
    showInDetail?: boolean;
    order?: number;
  };
}

export type FieldType = 'string' | 'number' | 'boolean' | 'date' | 'select';

export interface FieldValidation {
  required?: boolean;
  
  // For string type
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // For number type
  min?: number;
  max?: number;
  
  // For date type
  minDate?: Date;
  maxDate?: Date;
  
  // For select type
  options?: string[];
}