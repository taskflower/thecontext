// src/pages/stepsPlugins/validators.ts
import { Step } from "@/types";
import { ValidationResult, registerValidator, validateRequiredFields } from "./validation";
import { useStepStore } from "@/store/stepStore";

/**
 * Validator for the text-input plugin
 */
export function registerTextInputValidator() {
  registerValidator('text-input', (step: Step): ValidationResult => {
    const config = step.config || {};
    const { required = true, minLength = 0 } = config;
    
    // If the step has a result, check if the value meets requirements
    if (step.result) {
      const value = step.result.value || '';
      
      // Check if required and empty
      if (required && !value.trim()) {
        return {
          isValid: false,
          errorMessage: "This field is required"
        };
      }
      
      // Check minimum length
      if (minLength > 0 && value.length < minLength) {
        return {
          isValid: false,
          errorMessage: `Input must be at least ${minLength} characters`
        };
      }
      
      return { isValid: true };
    }
    
    // If the step doesn't have a result and is required, it's invalid
    if (required) {
      return {
        isValid: false,
        errorMessage: "Please provide the required information"
      };
    }
    
    return { isValid: true };
  });
}

/**
 * Validator for the step-reference plugin
 */
export function registerStepReferenceValidator() {
  registerValidator('step-reference', (step: Step): ValidationResult => {
    // Check if a reference step is selected
    const requiredFields = ['referenceStepId'];
    const basicValidation = validateRequiredFields(step, requiredFields);
    
    if (!basicValidation.isValid) {
      return {
        isValid: false,
        errorMessage: "Please select a step to reference"
      };
    }
    
    // Check if the referenced step exists and has a result
    const stepStore = useStepStore.getState();
    const referenceStepId = step.config?.referenceStepId;
    
    if (referenceStepId) {
      const referencedStep = stepStore.getStepById(referenceStepId);
      
      if (!referencedStep) {
        return {
          isValid: false,
          errorMessage: "The referenced step no longer exists"
        };
      }
      
      if (!referencedStep.result) {
        return {
          isValid: false,
          errorMessage: "The referenced step has no result data yet"
        };
      }
    }
    
    return { isValid: true };
  });
}

/**
 * Validator for the simple-plugin
 */
export function registerSimplePluginValidator() {
  registerValidator('simple-plugin', (step: Step): ValidationResult => {
    // Simple plugin doesn't have specific validation requirements
    return { isValid: true };
  });
}

/**
 * Register all validators
 */
export function registerAllValidators() {
  registerTextInputValidator();
  registerStepReferenceValidator();
  registerSimplePluginValidator();
  
  // Add more validator registrations here as needed
}