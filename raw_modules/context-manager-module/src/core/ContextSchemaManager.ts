// src/core/ContextSchemaManager.ts
// Zarządzanie schematami kontekstu

import { 
    ContextSchema, 
    ValidationResult, 
    ContextValidator, 
    SchemaProperty 
  } from '../types/SchemaTypes';
  
  /**
   * Zarządza schematami kontekstu i walidacją
   */
  export class ContextSchemaManager {
    private schemas: Map<string, ContextSchema> = new Map();
    private validator: ContextValidator;
  
    constructor(validator: ContextValidator) {
      this.validator = validator;
    }
  
    /**
     * Rejestruje nowy schemat
     */
    registerSchema(schema: ContextSchema): void {
      this.schemas.set(schema.id, schema);
    }
  
    /**
     * Pobiera schemat po ID
     */
    getSchema(id: string): ContextSchema | undefined {
      return this.schemas.get(id);
    }
  
    /**
     * Pobiera wszystkie zarejestrowane schematy
     */
    getAllSchemas(): ContextSchema[] {
      return Array.from(this.schemas.values());
    }
  
    /**
     * Waliduje dane kontekstu według schematu
     */
    validateContext(contextData: any, schemaId: string): ValidationResult {
      const schema = this.getSchema(schemaId);
      if (!schema) {
        return {
          valid: false,
          errors: [{ path: "", message: `Schemat z ID ${schemaId} nie został znaleziony` }],
        };
      }
      return this.validator.validate(contextData, schema);
    }
  
    /**
     * Generuje pusty kontekst na podstawie schematu z wartościami domyślnymi
     */
    createEmptyContext(schemaId: string): Record<string, any> {
      const schema = this.getSchema(schemaId);
      if (!schema) return {};
  
      return this.generateDefaultValues(schema);
    }
  
    /**
     * Generuje wartości domyślne na podstawie schematu
     */
    private generateDefaultValues(schema: ContextSchema): Record<string, any> {
      const result: Record<string, any> = {};
  
      for (const [key, prop] of Object.entries(schema.schema)) {
        if (prop.default !== undefined) {
          result[key] = prop.default;
        } else if (prop.type === "object" && prop.properties) {
          result[key] = this.generateDefaultValuesForProperties(prop.properties);
        } else if (prop.type === "array" && prop.items) {
          result[key] = [];
        } else {
          // Ustaw puste wartości na podstawie typu
          switch (prop.type) {
            case "string":
              result[key] = "";
              break;
            case "number":
              result[key] = 0;
              break;
            case "boolean":
              result[key] = false;
              break;
            case "object":
              result[key] = {};
              break;
            case "array":
              result[key] = [];
              break;
          }
        }
      }
  
      return result;
    }
  
    /**
     * Generuje wartości domyślne dla właściwości obiektu
     */
    private generateDefaultValuesForProperties(
      properties: Record<string, SchemaProperty>
    ): Record<string, any> {
      const result: Record<string, any> = {};
  
      for (const [key, prop] of Object.entries(properties)) {
        if (prop.default !== undefined) {
          result[key] = prop.default;
        } else if (prop.type === "object" && prop.properties) {
          result[key] = this.generateDefaultValuesForProperties(prop.properties);
        } else {
          // Ustaw puste wartości
          switch (prop.type) {
            case "string":
              result[key] = "";
              break;
            case "number":
              result[key] = 0;
              break;
            case "boolean":
              result[key] = false;
              break;
            case "object":
              result[key] = {};
              break;
            case "array":
              result[key] = [];
              break;
          }
        }
      }
  
      return result;
    }
  }