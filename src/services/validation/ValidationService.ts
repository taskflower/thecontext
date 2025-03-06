// src/services/validation/ValidationService.ts
import { z } from 'zod';
import { Step } from '@/types';

// Structured validation result
export interface ValidationResult {
  isValid: boolean;
  errors?: ValidationError[];
  errorMessage?: string;
}

// Detailed validation error
export interface ValidationError {
  path: string[];
  message: string;
  code: string;
}

// Validator function type
export type StepValidator = (step: Step) => ValidationResult;

// Registries - using Maps to store validators by plugin type
const schemaRegistry = new Map<string, z.ZodType<any>>();
const validatorRegistry = new Map<string, StepValidator[]>();

/**
 * Register a schema for a plugin type
 */
export function registerSchema(pluginType: string, schema: z.ZodType<any>): void {
  schemaRegistry.set(pluginType, schema);
  console.log(`Registered schema for plugin type: ${pluginType}`);
}

/**
 * Register a custom validator for a plugin type
 */
export function registerValidator(pluginType: string, validator: StepValidator): void {
  const validators = validatorRegistry.get(pluginType) || [];
  validators.push(validator);
  validatorRegistry.set(pluginType, validators);
  console.log(`Registered validator for plugin type: ${pluginType}`);
}

/**
 * Format Zod errors into our ValidationError format
 * Converting all path elements to strings to match our interface
 */
function formatZodErrors(error: z.ZodError): ValidationError[] {
  return error.errors.map(err => ({
    path: err.path.map(p => String(p)), // Convert all path elements to strings
    message: err.message,
    code: err.code
  }));
}

/**
 * Generate a human-readable error message from validation errors
 */
function generateErrorMessage(errors: ValidationError[]): string {
  if (errors.length === 0) return 'Validation failed';
  
  // For a single error, just return the message
  if (errors.length === 1) return errors[0].message;
  
  // For multiple errors, create a list
  return errors.map(err => {
    const path = err.path.join('.');
    return path ? `${path}: ${err.message}` : err.message;
  }).join('; ');
}

/**
 * Main validation function - validates a step using registered schemas and validators
 */
export function validateStep(step: Step): ValidationResult {
  if (!step || !step.type) {
    return {
      isValid: false,
      errorMessage: "Invalid step: missing type"
    };
  }

  // Get schema for this plugin type
  const schema = schemaRegistry.get(step.type);
  
  // Run schema validation if available
  if (schema) {
    try {
      schema.parse(step);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        return {
          isValid: false,
          errors,
          errorMessage: generateErrorMessage(errors)
        };
      }
    }
  }
  
  // Run custom validators if any
  const validators = validatorRegistry.get(step.type) || [];
  for (const validator of validators) {
    const result = validator(step);
    if (!result.isValid) {
      return result;
    }
  }
  
  // If no schema or validators, or if all pass
  return { isValid: true };
}

/**
 * Helper function to check required fields
 */
export function validateRequiredFields(
  step: Step, 
  fields: string[]
): ValidationResult {
  const config = step.config || {};
  const errors: ValidationError[] = [];
  
  for (const field of fields) {
    const value = config[field];
    
    if (value === undefined || value === null || value === '') {
      errors.push({
        path: ['config', field],
        message: `Field "${field}" is required`,
        code: 'required_field'
      });
    }
  }
  
  if (errors.length > 0) {
    return {
      isValid: false,
      errors,
      errorMessage: generateErrorMessage(errors)
    };
  }
  
  return { isValid: true };
}

/**
 * Helper to create validators based on Zod schemas
 */
export function createSchemaValidator<T = any>(schema: z.ZodType<T>): StepValidator {
  return (step: Step) => {
    try {
      schema.parse(step);
      return { isValid: true };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = formatZodErrors(error);
        return {
          isValid: false,
          errors,
          errorMessage: generateErrorMessage(errors)
        };
      }
      return {
        isValid: false,
        errorMessage: 'Unexpected validation error'
      };
    }
  };
}