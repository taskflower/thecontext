// src/modules/editor/components/ContextSchemaEditor.tsx
import { useLlmEngine } from '@/core';
import { useState } from 'react';

import { z } from 'zod';

interface ContextSchemaEditorProps {
  schema: Record<string, any>;
  onChange: (schema: Record<string, any>) => void;
}

export default function ContextSchemaEditor({ schema, onChange }: ContextSchemaEditorProps) {
  const [newSchemaKey, setNewSchemaKey] = useState('');
  const [llmPrompt, setLlmPrompt] = useState('');

  // LLM do generowania schematów
  const schemaGenerationSchema = z.object({
    schemas: z.record(z.object({
      type: z.literal('object'),
      properties: z.record(z.object({
        type: z.string(),
        label: z.string(),
        fieldType: z.string().optional(),
        required: z.boolean().optional(),
        enum: z.array(z.string()).optional(),
        enumLabels: z.record(z.string()).optional(),
        default: z.any().optional()
      }))
    }))
  });

  const { isLoading, result, start: generateSchema } = useLlmEngine({
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
                    required: { type: 'boolean' },
                    enum: { type: 'array', items: { type: 'string' } },
                    enumLabels: { type: 'object' },
                    default: {}
                  }
                }
              }
            }
          }
        }
      }
    },
    userMessage: llmPrompt,
    systemMessage: `Generate JSON schemas for data models based on user description. 
    Use appropriate field types: string, number, boolean
    Use appropriate fieldTypes: text, textarea, select, checkbox, email, date, number
    For enums, provide both enum values and enumLabels for display
    Set required: true for mandatory fields
    Provide sensible defaults where appropriate`
  });

  const addSchema = () => {
    if (!newSchemaKey.trim()) return;
    
    const newSchema = {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          label: 'Name',
          fieldType: 'text',
          required: true
        }
      }
    };

    onChange({
      ...schema,
      [newSchemaKey]: newSchema
    });
    setNewSchemaKey('');
  };

  const handleLlmGeneration = () => {
    if (!llmPrompt.trim()) return;
    generateSchema();
  };

  const applyGeneratedSchemas = () => {
    if (result?.schemas) {
      onChange({ ...schema, ...result.schemas });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* LLM Schema Generation */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-medium text-green-900 mb-3">🤖 Generate Schema with AI</h3>
        <div className="space-y-3">
          <textarea
            value={llmPrompt}
            onChange={(e) => setLlmPrompt(e.target.value)}
            placeholder="Describe the data model you want to create (e.g., 'Create a user profile schema with name, email, age, and preferences')"
            className="w-full px-3 py-2 border border-green-200 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleLlmGeneration}
              disabled={isLoading || !llmPrompt.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isLoading ? 'Generating...' : 'Generate Schema'}
            </button>
            {result && (
              <button
                onClick={applyGeneratedSchemas}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Generated Schemas
              </button>
            )}
          </div>
          {result && (
            <div className="text-sm text-green-700">
              ✅ Generated {Object.keys(result.schemas || {}).length} schemas
            </div>
          )}
        </div>
      </div>

      {/* Manual Schema Creation */}
      <div>
        <h3 className="font-medium text-zinc-900 mb-3">Add New Schema</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newSchemaKey}
            onChange={(e) => setNewSchemaKey(e.target.value)}
            placeholder="Schema name (e.g., 'user', 'product')"
            className="flex-1 px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
          />
          <button
            onClick={addSchema}
            disabled={!newSchemaKey.trim()}
            className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
          >
            Add Schema
          </button>
        </div>
      </div>

      {/* Schema List */}
      <div className="space-y-4">
        <h3 className="font-medium text-zinc-900">Context Schemas ({Object.keys(schema).length})</h3>
        {Object.entries(schema).map(([key, schemaObj]) => (
          <div key={key} className="border border-zinc-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-zinc-900">{key}</h4>
              <button
                onClick={() => {
                  const newSchema = { ...schema };
                  delete newSchema[key];
                  onChange(newSchema);
                }}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="text-sm text-zinc-600">
              Fields: {Object.keys(schemaObj.properties || {}).join(', ') || 'None'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}