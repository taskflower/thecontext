// src/pages/stepsPlugins/textInput/validation.ts
import { z } from 'zod';
import { Step } from '@/types';
import { registerSchema, registerValidator } from '@/services/validation';
// Import ValidationResult as a type
import type { ValidationResult } from '@/services/validation';

// Schema for text input plugin
export const textInputSchema = z.object({
  id: z.string(),
  type: z.literal('text-input'),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskId: z.string(),
  order: z.number().int().nonnegative(),
  config: z.object({
    placeholder: z.string().optional(),
    minLength: z.number().min(0).optional().default(0),
    maxLength: z.number().min(0).optional(),
    required: z.boolean().optional().default(true),
    multiline: z.boolean().optional().default(true),
    rows: z.number().min(1).optional().default(6)
  }).optional().default({}),
  result: z.object({
    value: z.string()
  }).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped'])
}).refine(data => {
  // Skip validation if no result or not required
  if (!data.result || data.config?.required === false) return true;
  
  // If required, validate value is not empty
  return !!data.result.value.trim();
}, {
  message: "This field is required",
  path: ["result", "value"]
}).refine(data => {
  // Skip validation if no result or no minLength
  if (!data.result || !data.config?.minLength) return true;
  
  // Validate min length
  return data.result.value.length >= data.config.minLength;
}, {
  message: "Text is too short",
  path: ["result", "value"]
}).refine(data => {
  // Skip validation if no result or no maxLength
  if (!data.result || !data.config?.maxLength) return true;
  
  // Validate max length
  return data.result.value.length <= data.config.maxLength;
}, {
  message: "Text is too long",
  path: ["result", "value"]
});

// Custom validator for additional business rules
export function textInputValidator(step: Step): ValidationResult {
  const config = step.config || {};
  const result = step.result;
  
  // No validation needed if step isn't completed yet
  if (step.status !== 'completed') {
    return { isValid: true };
  }
  
  // Validate required field for completed steps
  if (config.required !== false && (!result || !result.value || !result.value.trim())) {
    return {
      isValid: false,
      errorMessage: "Required field cannot be empty"
    };
  }
  
  return { isValid: true };
}

// Automatically register with validation system
registerSchema('text-input', textInputSchema);
registerValidator('text-input', textInputValidator);