// src/core/ContextValidator.ts
// Walidacja danych kontekstowych

import { 
    ContextValidator as IContextValidator,
    ContextSchema, 
    ValidationResult, 
    ValidationError, 
    SchemaProperty 
  } from '../types/SchemaTypes';
  
  /**
   * Domyślny walidator kontekstu
   */
  export class DefaultContextValidator implements IContextValidator {
    validate(value: any, schema: ContextSchema): ValidationResult {
      const errors: ValidationError[] = [];
      
      // Sprawdź wymagane pola
      if (schema.required) {
        for (const requiredField of schema.required) {
          if (value[requiredField] === undefined) {
            errors.push({
              path: requiredField,
              message: `Wymagane pole "${requiredField}" nie istnieje`
            });
          }
        }
      }
      
      // Walidacja wartości według schematu
      for (const [field, propSchema] of Object.entries(schema.schema)) {
        const fieldValue = value[field];
        
        if (fieldValue !== undefined) {
          this.validateProperty(fieldValue, propSchema, field, errors);
        }
      }
      
      return {
        valid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    }
    
    private validateProperty(
      value: any, 
      propSchema: SchemaProperty, 
      path: string, 
      errors: ValidationError[]
    ): void {
      // Sprawdź typ
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      if (actualType !== propSchema.type) {
        errors.push({
          path,
          message: `Oczekiwano typu "${propSchema.type}" a otrzymano "${actualType}"`
        });
        return;
      }
      
      // Walidacja specyficzna dla typu
      switch (propSchema.type) {
        case 'string':
          this.validateString(value, propSchema, path, errors);
          break;
        case 'number':
          this.validateNumber(value, propSchema, path, errors);
          break;
        case 'array':
          this.validateArray(value, propSchema, path, errors);
          break;
        case 'object':
          this.validateObject(value, propSchema, path, errors);
          break;
      }
    }
    
    private validateString(
      value: string, 
      propSchema: SchemaProperty, 
      path: string, 
      errors: ValidationError[]
    ): void {
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push({
          path,
          message: `Wartość musi być jedną z: ${propSchema.enum.join(', ')}`
        });
      }
      
      if (propSchema.format === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.push({
            path,
            message: 'Nieprawidłowy format adresu email'
          });
        }
      }
    }
    
    private validateNumber(
      value: number, 
      propSchema: SchemaProperty, 
      path: string, 
      errors: ValidationError[]
    ): void {
      if (propSchema.enum && !propSchema.enum.includes(value)) {
        errors.push({
          path,
          message: `Wartość musi być jedną z: ${propSchema.enum.join(', ')}`
        });
      }
    }
    
    private validateArray(
      value: any[], 
      propSchema: SchemaProperty, 
      path: string, 
      errors: ValidationError[]
    ): void {
      if (propSchema.items) {
        value.forEach((item, index) => {
          this.validateProperty(item, propSchema.items!, `${path}[${index}]`, errors);
        });
      }
    }
    
    private validateObject(
      value: Record<string, any>, 
      propSchema: SchemaProperty, 
      path: string, 
      errors: ValidationError[]
    ): void {
      if (propSchema.properties) {
        for (const [key, schema] of Object.entries(propSchema.properties)) {
          if (value[key] !== undefined) {
            this.validateProperty(value[key], schema, `${path}.${key}`, errors);
          }
        }
      }
    }
  }
  