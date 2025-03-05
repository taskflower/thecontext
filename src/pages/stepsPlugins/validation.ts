// src/pages/stepsPlugins/validation.ts
import { Step } from "@/types";
import { validateStepReference } from '@/components/plugins/PreviousStepsSelect';

// Simple interface for validation result
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Definition of validator function type
export type StepValidator = (step: Step) => ValidationResult;

// Map storing validators by plugin type
const pluginValidators = new Map<string, StepValidator>();

/**
 * Register a validator for a specific plugin type
 */
export function registerValidator(pluginType: string, validator: StepValidator): void {
  pluginValidators.set(pluginType, validator);
}

/**
 * Validate a step based on its type
 */
export function validateStep(step: Step): ValidationResult {
  // Find validator for this step type
  const validator = pluginValidators.get(step.type);
  
  // If no validator exists, consider the step valid
  if (!validator) {
    return { isValid: true };
  }
  
  // Run the validator
  return validator(step);
}

/**
 * Helper function to validate required fields in configuration
 */
export function validateRequiredFields(
  step: Step, 
  requiredFields: string[]
): ValidationResult {
  const config = step.config || {};
  
  for (const field of requiredFields) {
    const value = config[field];
    
    if (value === undefined || value === null || value === '') {
      return {
        isValid: false,
        errorMessage: `Field "${field}" is required`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Simple validators for common cases
 */

// Text input validator
export function textInputValidator(step: Step): ValidationResult {
  const { result, config = {} } = step;
  const { required = true, minLength = 0 } = config;
  
  // If step has a result, check if it meets requirements
  if (result?.value) {
    const value = result.value;
    
    if (required && !value.trim()) {
      return {
        isValid: false,
        errorMessage: "This field is required"
      };
    }
    
    if (minLength > 0 && value.length < minLength) {
      return {
        isValid: false,
        errorMessage: `Text must be at least ${minLength} characters`
      };
    }
    
    return { isValid: true };
  }
  
  // If step has no result and is required, consider it invalid
  if (required) {
    return {
      isValid: false,
      errorMessage: "Fill in this field before continuing"
    };
  }
  
  return { isValid: true };
}

// Step reference validator - using our encapsulated validator
export function referenceValidator(step: Step): ValidationResult {
  const { config = {} } = step;
  
  // Use the encapsulated validation function
  return validateStepReference(config.referenceStepId || '', true);
}

// Simple plugin validator (always returns success)
export function simpleValidator(): ValidationResult {
  return { isValid: true };
}

// Register default validators
export function registerDefaultValidators() {
  registerValidator('text-input', textInputValidator);
  registerValidator('step-reference', referenceValidator);
  registerValidator('simple-plugin', simpleValidator);
}