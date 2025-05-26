// src/modules/edv2/shared/SchemaEditor.tsx
import { useState } from 'react';
import { useLlmEngine } from '@/core/engine';
import { z } from 'zod';

interface SchemaEditorProps {
  schema: any;
  onChange: (schema: any) => void;
}

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

export function SchemaEditor({ schema, onChange }: SchemaEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [newSchemaKey, setNewSchemaKey] = useState('');

  const { isLoading, result, start } = useLlmEngine({
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
    },
    userMessage: prompt,
    systemMessage: 'Generate JSON schemas for data models. Use appropriate field types and fieldTypes.'
  });

  const addSchema = () => {
    if (!newSchemaKey.trim()) return;
    onChange({
      ...schema,
      [newSchemaKey]: {
        type: 'object',
        properties: {
          name: { type: 'string', label: 'Name', fieldType: 'text', required: true }
        }
      }
    });
    setNewSchemaKey('');
  };

  const removeSchema = (key: string) => {
    const newSchema = { ...schema };
    delete newSchema[key];
    onChange(newSchema);
  };

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-green-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe data model to generate..."
          className="w-full text-sm border rounded p-2 mb-2"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={() => start()}
            disabled={isLoading || !prompt.trim()}
            className="text-xs bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          {result && (
            <button
              onClick={() => onChange({ ...schema, ...result.schemas })}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded"
            >
              Apply Schemas
            </button>
          )}
        </div>
      </div>

      {/* Manual Add */}
      <div className="flex gap-2">
        <input
          value={newSchemaKey}
          onChange={(e) => setNewSchemaKey(e.target.value)}
          placeholder="Schema name"
          className="flex-1 text-sm border rounded px-2 py-1"
        />
        <button
          onClick={addSchema}
          disabled={!newSchemaKey.trim()}
          className="text-xs bg-zinc-900 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add
        </button>
      </div>

      {/* Schema List */}
      <div className="space-y-2">
        {Object.entries(schema).map(([key, schemaObj]: [string, any]) => (
          <div key={key} className="border rounded p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{key}</span>
              <button
                onClick={() => removeSchema(key)}
                className="text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Fields: {Object.keys(schemaObj.properties || {}).join(', ') || 'None'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}