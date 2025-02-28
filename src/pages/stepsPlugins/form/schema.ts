/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/plugins/form/schema.ts
import { z } from "zod";

// Define validation schema for form options
const FormPluginSchema = z.object({
  options: z.object({
    allowMultiple: z.boolean().optional().default(false),
    savePartial: z.boolean().optional().default(true),
    autoSubmitDelay: z.number().min(0).optional()
  }).optional().default({}),
  
  // Basic configuration for the form
  config: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    submitLabel: z.string().optional().default("Submit"),
    
    // Form fields definition
    fields: z.array(
      z.object({
        name: z.string(),
        label: z.string(),
        type: z.enum(['text', 'textarea', 'number', 'email', 'date', 'select', 'checkbox']),
        required: z.boolean().default(false),
        placeholder: z.string().optional(),
        defaultValue: z.any().optional(),
        
        // Options for select fields
        options: z.array(
          z.object({
            label: z.string(),
            value: z.string()
          })
        ).optional(),
        
        // Validation rules
        validation: z.object({
          pattern: z.string().optional(),
          min: z.number().optional(),
          max: z.number().optional(),
          minLength: z.number().optional(),
          maxLength: z.number().optional()
        }).optional()
      })
    )
  })
});

export default FormPluginSchema;

// Helper function to validate form configuration against schema
export function validateFormConfig(config: any) {
  try {
    return FormPluginSchema.parse(config);
  } catch (error) {
    console.error("Form configuration validation error:", error);
    throw error;
  }
}