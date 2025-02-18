/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/naturalSchema/validator.ts
import { Schema, SchemaProperty } from './types';

export class SchemaValidator {
  private static validateValue(
    value: any, 
    schema: SchemaProperty, 
    path: string = ''
  ): string[] {
    const errors: string[] = [];

    // Sprawdzanie typu
    if (schema.type === 'object') {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`${path}: expected object`);
        return errors;
      }

      // Walidacja zagnieżdżonych właściwości
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, propSchema]) => {
          const propPath = path ? `${path}.${key}` : key;
          const propValue = value[key];

          // Sprawdzanie wymaganych pól
          const isRequired = propSchema.validation?.some(
            rule => rule.type === 'required' && rule.value === true
          );
          
          if (isRequired && propValue === undefined) {
            errors.push(`${propPath}: field is required`);
            return;
          }

          if (propValue !== undefined) {
            errors.push(...this.validateValue(propValue, propSchema, propPath));
          }
        });
      }
    }
    else if (schema.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${path}: expected array`);
        return errors;
      }

      // Walidacja elementów tablicy
      if (schema.items) {
        value.forEach((item, index) => {
          errors.push(...this.validateValue(item, schema.items!, `${path}[${index}]`));
        });
      }
    }
    else {
      // Walidacja typów prostych
      const actualType = typeof value;
      if (actualType !== schema.type && value !== null) {
        errors.push(`${path}: expected ${schema.type}, got ${actualType}`);
      }

      // Walidacja reguł
      if (schema.validation) {
        schema.validation.forEach(rule => {
          switch (rule.type) {
            case 'min':
              if (schema.type === 'string' && value.length < rule.value) {
                errors.push(`${path}: string length below minimum ${rule.value}`);
              } else if (schema.type === 'number' && value < rule.value) {
                errors.push(`${path}: value below minimum ${rule.value}`);
              }
              break;

            case 'max':
              if (schema.type === 'string' && value.length > rule.value) {
                errors.push(`${path}: string length above maximum ${rule.value}`);
              } else if (schema.type === 'number' && value > rule.value) {
                errors.push(`${path}: value above maximum ${rule.value}`);
              }
              break;

            case 'pattern':
              if (schema.type === 'string' && !new RegExp(rule.value as string).test(value)) {
                errors.push(`${path}: does not match pattern ${rule.value}`);
              }
              break;

            case 'enum':
              if (!(rule.value as string[]).includes(value)) {
                errors.push(`${path}: must be one of [${(rule.value as string[]).join(', ')}]`);
              }
              break;
          }
        });
      }
    }

    return errors;
  }

  static validate(data: any, schema: Schema): string[] {
    return this.validateValue(data, schema);
  }
}