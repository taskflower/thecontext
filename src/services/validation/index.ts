// src/services/validation/index.ts
// Export functions
export { 
    validateStep,
    registerSchema,
    registerValidator,
    createSchemaValidator,
    validateRequiredFields
  } from './ValidationService';
  
  // Export types using the required export type syntax
  export type { 
    ValidationResult,
    ValidationError,
    StepValidator
  } from './ValidationService';