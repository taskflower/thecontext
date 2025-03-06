// src/hooks/useStepValidation.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { Step } from '@/types';
import { validateStep } from '@/services/validation';
// Import types properly
import type { ValidationResult } from '@/services/validation';

interface ValidationHookOptions {
  validateOnMount?: boolean;
  validateOnChange?: boolean;
  debounceMs?: number;
}

/**
 * React hook for step validation
 */
export function useStepValidation(
  step: Step, 
  options: ValidationHookOptions = {}
) {
  const { 
    validateOnMount = false, 
    validateOnChange = true,
    debounceMs = 300
  } = options;
  
  // Validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({ isValid: true });
  const [isDirty, setIsDirty] = useState(false);
  
  // Debounce timeout ref
  const debounceTimeout = useRef<number | null>(null);
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);
  
  // Validation function
  const validate = useCallback(() => {
    // Clear any existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
    
    const result = validateStep(step);
    setValidationResult(result);
    return result.isValid;
  }, [step]);
  
  // Debounced validation
  const debouncedValidate = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }
    
    debounceTimeout.current = window.setTimeout(() => {
      validate();
      debounceTimeout.current = null;
    }, debounceMs);
  }, [validate, debounceMs]);
  
  // Validate on mount if enabled
  useEffect(() => {
    if (validateOnMount) {
      validate();
    }
  }, [validateOnMount, validate]);
  
  // Validate on change if enabled and dirty
  useEffect(() => {
    if (validateOnChange && isDirty) {
      debouncedValidate();
    }
  }, [step, isDirty, validateOnChange, debouncedValidate]);
  
  // Mark as dirty
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);
  
  // Reset validation
  const resetValidation = useCallback(() => {
    setValidationResult({ isValid: true });
    setIsDirty(false);
  }, []);
  
  return {
    isValid: validationResult.isValid,
    errorMessage: validationResult.errorMessage,
    errors: validationResult.errors,
    validate,
    markDirty,
    resetValidation,
    isDirty
  };
}