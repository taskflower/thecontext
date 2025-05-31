// ========================================
// src/modules/edv2/shared/editorConfigs.ts
// ========================================
import { z } from 'zod';
import type { AIGeneratorConfig } from './types';

const nodeSchema = z.object({
  nodes: z.array(z.object({
    slug: z.string(),
    label: z.string(),
    tplFile: z.string(),
    order: z.number(),
    description: z.string().optional(),
    validations: z.array(z.string()).optional(),
    handlers: z.record(z.string()).optional()
  }))
});

const widgetSchema = z.object({
  widgets: z.array(z.object({
    tplFile: z.enum(['ButtonWidget', 'InfoWidget', 'TitleWidget']),
    title: z.string(),
    attrs: z.record(z.any())
  }))
});

const schemaGenerationSchema = z.object({
  schemas: z.record(z.object({
    type: z.literal('object'),
    properties: z.record(z.object({
      type: z.string(),
      label: z.string(),
      fieldType: z.string().optional(),
      required: z.boolean().optional()
    }))
  }))
});

const flowSchema = z.object({
  flow: z.object({
    entryPoint: z.string(),
    transitions: z.record(z.object({
      onSuccess: z.string().optional(),
      onError: z.string().optional(),
      onCancel: z.string().optional(),
      conditions: z.record(z.string()).optional()
    }))
  })
});

export const AI_CONFIGS: Record<string, AIGeneratorConfig> = {
  nodes: {
    type: 'nodes',
    placeholder: 'Describe scenario steps (e.g., "Create ticket management workflow with list, create, edit, delete")',
    buttonText: 'Generate Steps',
    systemMessage: 'Generate scenario nodes/steps. Common templates: ListTemplate, CreateTemplate, EditTemplate, ViewTemplate, DeleteTemplate. Order steps logically.',
    schema: nodeSchema,
    jsonSchema: {
      type: 'object',
      properties: {
        nodes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              slug: { type: 'string' },
              label: { type: 'string' },
              tplFile: { type: 'string' },
              order: { type: 'number' },
              description: { type: 'string' },
              validations: { type: 'array', items: { type: 'string' } },
              handlers: { type: 'object' }
            }
          }
        }
      }
    }
  },
  widgets: {
    type: 'widgets',
    placeholder: 'Describe widgets to generate...',
    buttonText: 'Generate',
    systemMessage: 'Generate widgets based on description. Use ButtonWidget for navigation, InfoWidget for info panels, TitleWidget for headers.',
    schema: widgetSchema,
    jsonSchema: {
      type: 'object',
      properties: {
        widgets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tplFile: { type: 'string', enum: ['ButtonWidget', 'InfoWidget', 'TitleWidget'] },
              title: { type: 'string' },
              attrs: { type: 'object' }
            }
          }
        }
      }
    }
  },
  schema: {
    type: 'schema',
    placeholder: 'Describe data model to generate...',
    buttonText: 'Generate',
    systemMessage: 'Generate JSON schemas for data models. Use appropriate field types and fieldTypes.',
    schema: schemaGenerationSchema,
    jsonSchema: {
      type: 'object',
      properties: {
        schemas: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              properties: {
                type: 'object',
                additionalProperties: {
                  type: 'object',
                  properties: {
                    type: { type: 'string' },
                    label: { type: 'string' },
                    fieldType: { type: 'string' },
                    required: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  flow: {
    type: 'flow',
    placeholder: 'Describe flow logic (e.g., "After create success go to view, on error stay, cancel returns to list")',
    buttonText: 'Generate Flow',
    systemMessage: 'Generate flow transitions between steps. Define entry point and transitions (onSuccess, onError, onCancel).',
    schema: flowSchema,
    jsonSchema: {
      type: 'object',
      properties: {
        flow: {
          type: 'object',
          properties: {
            entryPoint: { type: 'string' },
            transitions: {
              type: 'object',
              additionalProperties: {
                type: 'object',
                properties: {
                  onSuccess: { type: 'string' },
                  onError: { type: 'string' },
                  onCancel: { type: 'string' },
                  conditions: { type: 'object' }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const TEMPLATES = [
  'ListTemplate', 'CreateTemplate', 'EditTemplate', 
  'ViewTemplate', 'DeleteTemplate', 'FormTemplate', 'SearchTemplate'
];

export const WIDGET_TYPES = ['ButtonWidget', 'InfoWidget', 'TitleWidget'];