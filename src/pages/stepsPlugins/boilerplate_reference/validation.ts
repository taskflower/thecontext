import { z } from 'zod';
import { Step } from '@/types';
import { registerSchema, registerValidator } from '@/services/validation';
import type { ValidationResult } from '@/services/validation';
import { validateStepReference, getStepData } from '@/components/plugins/PreviousStepsSelect';

// Schema for step reference plugin
export const stepReferenceSchema = z.object({
  id: z.string(),
  type: z.literal('step-reference'),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskId: z.string(),
  order: z.number().int().nonnegative(),
  config: z.object({
    referenceStepId: z.string().optional()
  }).optional().default({}),
  result: z.object({
    referencedData: z.any().optional(),
    referencedStepId: z.string().optional(),
    referencedStepTitle: z.string().optional(),
    timestamp: z.string().optional()
  }).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped'])
}).refine(data => {
  // Validate reference step for completed steps
  if (data.status === 'completed') {
    const referenceValidation = validateStepReference(
      data.config?.referenceStepId || '',
      true
    );
    return referenceValidation.isValid;
  }
  return true;
}, {
  message: "Invalid step reference",
  path: ["config", "referenceStepId"]
});

// Custom validator for additional business rules
export function stepReferenceValidator(step: Step): ValidationResult {
  const config = step.config || {};
  
  // No validation needed if step isn't completed yet
  if (step.status !== 'completed') {
    return { isValid: true };
  }
  
  // Validate reference step
  const referenceStepId = config.referenceStepId;
  const referenceValidation = validateStepReference(referenceStepId, true);
  
  if (!referenceValidation.isValid) {
    return {
      isValid: false,
      errorMessage: referenceValidation.errorMessage
    };
  }
  
  // Additional validation for result data
  const stepData = getStepData(referenceStepId);
  
  if (stepData.error) {
    return {
      isValid: false,
      errorMessage: stepData.error
    };
  }
  
  return { isValid: true };
}

// Automatically register with validation system
registerSchema('step-reference', stepReferenceSchema);
registerValidator('step-reference', stepReferenceValidator);