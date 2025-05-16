// src/themes/default/components/commons/form/types.ts
export interface FieldSchema {
    fieldType: string;
    title: string;
    required?: boolean;
    description?: string;
    placeholder?: string;
    options?: { label: string; value: string }[];
    min?: number;
    max?: number;
    step?: number;
    isArray?: boolean;
    // Dodatkowe pola, które mogą być potrzebne
    [key: string]: any;
  }
  
  export interface FieldProps {
    fieldName: string;
    fieldSchema: FieldSchema;
    fieldValue: any;
    fieldError?: string;
    handleChange: (fieldName: string, value: any) => void;
    nodeSlug?: string;
  }