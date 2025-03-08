// src/pages/stepsPlugins/llmQuery/validation.ts
import { z } from 'zod';
import { registerSchema } from '@/services/validation';

const conversationMessageSchema = z.object({
  role: z.string(),
  content: z.string()
});

export const llmQuerySchema = z.object({
  id: z.string(),
  type: z.literal('llm-query'),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskId: z.string(),
  order: z.number().int().nonnegative(),
  config: z.object({
    referenceStepId: z.string().min(1, "Reference step is required").optional()
  }).optional().default({ referenceStepId: '' }),
  result: z.object({
    content: z.string().optional(),
    messages: z.array(conversationMessageSchema).optional(),
    conversationData: z.array(conversationMessageSchema).optional()
  }).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped'])
});

registerSchema('llm-query', llmQuerySchema);