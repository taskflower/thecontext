// src/modules/simpleSchemaEditor/types/index.ts
export interface SchemaField {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    label?: string;
    fieldType?: 'text' | 'textarea' | 'select' | 'checkbox' | 'email' | 'date' | 'userSelect' | 'number';
    required?: boolean;
    description?: string;
    aiHint?: string;
    default?: any;
    enum?: string[];
    enumLabels?: Record<string, string>;
    minimum?: number;
    maximum?: number;
    pattern?: string;
    properties?: Record<string, SchemaField>;
  }
  
  export interface Schema {
    type: 'object';
    properties: Record<string, SchemaField>;
    required?: string[];
    description?: string;
  }
  
  export interface ContextSchema {
    [schemaName: string]: Schema;
  }