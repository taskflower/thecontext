// src/pages/stepsPlugins/validation.ts
import { Step } from "@/types";

// Prosty interfejs wyniku walidacji
export interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

// Definicja typu funkcji walidującej
export type StepValidator = (step: Step) => ValidationResult;

// Mapa przechowująca walidatory wg typu pluginu
const pluginValidators = new Map<string, StepValidator>();

/**
 * Rejestruje walidator dla konkretnego typu pluginu
 */
export function registerValidator(pluginType: string, validator: StepValidator): void {
  pluginValidators.set(pluginType, validator);
}

/**
 * Waliduje krok na podstawie jego typu
 */
export function validateStep(step: Step): ValidationResult {
  // Znajdź walidator dla danego typu kroku
  const validator = pluginValidators.get(step.type);
  
  // Jeśli nie ma walidatora, uznaj krok za prawidłowy
  if (!validator) {
    return { isValid: true };
  }
  
  // Uruchom walidator
  return validator(step);
}

/**
 * Pomocnicza funkcja do walidacji wymaganych pól w konfiguracji
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
        errorMessage: `Pole "${field}" jest wymagane`
      };
    }
  }
  
  return { isValid: true };
}

/**
 * Proste walidatory dla typowych przypadków
 */

// Walidator dla pól tekstowych
export function textInputValidator(step: Step): ValidationResult {
  const { result, config = {} } = step;
  const { required = true, minLength = 0 } = config;
  
  // Jeśli krok ma wynik, sprawdź czy spełnia wymagania
  if (result?.value) {
    const value = result.value;
    
    if (required && !value.trim()) {
      return {
        isValid: false,
        errorMessage: "To pole jest wymagane"
      };
    }
    
    if (minLength > 0 && value.length < minLength) {
      return {
        isValid: false,
        errorMessage: `Tekst musi mieć co najmniej ${minLength} znaków`
      };
    }
    
    return { isValid: true };
  }
  
  // Jeśli krok nie ma wyniku i jest wymagany, uznaj za nieprawidłowy
  if (required) {
    return {
      isValid: false,
      errorMessage: "Uzupełnij to pole przed kontynuacją"
    };
  }
  
  return { isValid: true };
}

// Walidator sprawdzający czy krok odniesienia ma zdefiniowany cel
export function referenceValidator(step: Step): ValidationResult {
  const { config = {} } = step;
  
  if (!config.referenceStepId) {
    return {
      isValid: false,
      errorMessage: "Wybierz krok, do którego chcesz się odnieść"
    };
  }
  
  return { isValid: true };
}

// Walidator dla prostych pluginów (zawsze zwraca success)
export function simpleValidator(): ValidationResult {
  return { isValid: true };
}

// Rejestruj podstawowe walidatory
export function registerDefaultValidators() {
  registerValidator('text-input', textInputValidator);
  registerValidator('step-reference', referenceValidator);
  registerValidator('simple-plugin', simpleValidator);
}