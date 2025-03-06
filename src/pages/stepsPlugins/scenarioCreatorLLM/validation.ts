// src/pages/stepsPlugins/scenarioCreatorLLM/validation.ts
import { z } from 'zod';
import { registerSchema } from '@/services/validation';

// Schema for scenario creator LLM plugin
export const scenarioCreatorLLMSchema = z.object({
  id: z.string(),
  type: z.literal('scenario-creator-llm'),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskId: z.string(),
  order: z.number().int().nonnegative(),
  config: z.object({
    projectPrefix: z.string().optional().default('LLM Campaign'),
    inputPrompt: z.string().optional().default('Generate 3 marketing scenarios for a new product launch'),
    mockResponse: z.boolean().optional().default(true)
  }).optional().default({}),
  result: z.object({
    createdScenarios: z.array(z.any()).optional(),
    createdTasks: z.array(z.any()).optional(),
    createdSteps: z.array(z.any()).optional(),
    timestamp: z.string().optional()
  }).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped'])
});

// Register schema
registerSchema('scenario-creator-llm', scenarioCreatorLLMSchema);