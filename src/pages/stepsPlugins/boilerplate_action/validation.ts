// src/pages/stepsPlugins/boilerplate_action/validation.ts
import { z } from 'zod';
import { registerSchema } from '@/services/validation';

// Simple schema for the basic plugin
const simplePluginSchema = z.object({
  id: z.string(),
  type: z.literal('simple-plugin'),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  taskId: z.string(),
  order: z.number().int().nonnegative(),
  config: z.object({}).optional().default({}),
  result: z.object({
    completed: z.boolean().optional(),
    timestamp: z.string().optional()
  }).optional().nullable(),
  status: z.enum(['pending', 'in-progress', 'completed', 'skipped'])
});

// Register schema
registerSchema('simple-plugin', simplePluginSchema);