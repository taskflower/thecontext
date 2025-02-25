import { DocumentRelation } from "./relation";

// src/types/validation.ts
export interface ValidationResult {
    isValid: boolean;
    error?: string;
  }
  
  export interface DocumentValidationResult extends ValidationResult {
    document?: Document;
  }
  
  export interface RelationValidationResult extends ValidationResult {
    relation?: DocumentRelation;
  }