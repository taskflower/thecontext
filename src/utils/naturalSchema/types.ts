// src/utils/naturalSchema/types.ts
export type SchemaType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'required' | 'enum';
  value: string | number | boolean | string[];
}

export interface SchemaProperty {
  type: SchemaType;
  validation?: ValidationRule[];
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;  // dla tablic
}

export interface Schema {
  type: 'object';
  properties: Record<string, SchemaProperty>;
}