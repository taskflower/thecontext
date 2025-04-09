// src/types/SchemaTypes.ts
// Definicje typów dla schematów kontekstu

/**
 * Reprezentuje schemat kontekstu
 */
export interface ContextSchema {
    id: string;
    title: string;
    schema: Record<string, SchemaProperty>;
    required?: string[];
    description?: string;
  }
  
  /**
   * Właściwość schematu
   */
  export interface SchemaProperty {
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    description?: string;
    default?: any;
    items?: SchemaProperty; // dla tablic
    properties?: Record<string, SchemaProperty>; // dla obiektów
    format?: string; // np. 'email', 'date-time', itp.
    enum?: Array<string | number>; // dla wartości z listy
  }
  
  /**
   * Wynik walidacji kontekstu
   */
  export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
  }
  
  /**
   * Błąd walidacji
   */
  export interface ValidationError {
    path: string;
    message: string;
  }
  
  /**
   * Interfejs dla walidatora kontekstu
   */
  export interface ContextValidator {
    validate(value: any, schema: ContextSchema): ValidationResult;
  }