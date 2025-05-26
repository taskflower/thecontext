// src/modules/edv2/scenario/NodesEditor.tsx
import { useState } from 'react';
import { useLlmEngine } from '@/core/engine';
import { z } from 'zod';

interface NodesEditorProps {
  nodes: any[];
  onChange: (nodes: any[]) => void;
}

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

export function NodesEditor({ nodes, onChange }: NodesEditorProps) {
  const [prompt, setPrompt] = useState('');
  const [newNodeSlug, setNewNodeSlug] = useState('');

  const { isLoading, result, start } = useLlmEngine({
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
    },
    userMessage: prompt,
    systemMessage: 'Generate scenario nodes/steps. Common templates: ListTemplate, CreateTemplate, EditTemplate, ViewTemplate, DeleteTemplate. Order steps logically.'
  });

  const addNode = () => {
    if (!newNodeSlug.trim()) return;
    onChange([...nodes, {
      slug: newNodeSlug,
      label: newNodeSlug.charAt(0).toUpperCase() + newNodeSlug.slice(1),
      tplFile: 'ListTemplate',
      order: nodes.length + 1,
      description: '',
      validations: [],
      handlers: {}
    }]);
    setNewNodeSlug('');
  };

  const removeNode = (index: number) => {
    onChange(nodes.filter((_, i) => i !== index));
  };

  const updateNode = (index: number, updates: any) => {
    const newNodes = [...nodes];
    newNodes[index] = { ...newNodes[index], ...updates };
    onChange(newNodes);
  };

  const moveNode = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === nodes.length - 1)) return;
    
    const newNodes = [...nodes];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newNodes[index], newNodes[targetIndex]] = [newNodes[targetIndex], newNodes[index]];
    
    newNodes.forEach((node, i) => {
      node.order = i + 1;
    });
    
    onChange(newNodes);
  };

  const templates = [
    'ListTemplate', 'CreateTemplate', 'EditTemplate', 
    'ViewTemplate', 'DeleteTemplate', 'FormTemplate', 'SearchTemplate'
  ];

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-purple-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe scenario steps (e.g., 'Create ticket management workflow with list, create, edit, delete')"
          className="w-full text-sm border rounded p-2 mb-2"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={() => start()}
            disabled={isLoading || !prompt.trim()}
            className="text-xs bg-purple-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Steps'}
          </button>
          {result && (
            <button
              onClick={() => onChange([...nodes, ...result.nodes])}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded"
            >
              Add Generated
            </button>
          )}
        </div>
      </div>

      {/* Manual Add */}
      <div className="flex gap-2">
        <input
          value={newNodeSlug}
          onChange={(e) => setNewNodeSlug(e.target.value)}
          placeholder="Step slug (e.g., 'list', 'create')"
          className="flex-1 text-sm border rounded px-2 py-1"
        />
        <button
          onClick={addNode}
          disabled={!newNodeSlug.trim()}
          className="text-xs bg-zinc-900 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          Add Step
        </button>
      </div>

      {/* Nodes List */}
      <div className="space-y-2">
        {nodes.sort((a, b) => a.order - b.order).map((node, index) => (
          <div key={index} className="border rounded p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-zinc-200 px-2 py-1 rounded">{node.order}</span>
                <span className="text-sm font-medium">{node.slug}</span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => moveNode(index, 'up')}
                  disabled={index === 0}
                  className="text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-50"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveNode(index, 'down')}
                  disabled={index === nodes.length - 1}
                  className="text-xs text-zinc-600 hover:text-zinc-800 disabled:opacity-50"
                >
                  ↓
                </button>
                <button
                  onClick={() => removeNode(index)}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <input
                value={node.label}
                onChange={(e) => updateNode(index, { label: e.target.value })}
                className="w-full text-sm border rounded px-2 py-1"
                placeholder="Display label"
              />
              
              <select
                value={node.tplFile}
                onChange={(e) => updateNode(index, { tplFile: e.target.value })}
                className="w-full text-sm border rounded px-2 py-1"
              >
                {templates.map(tpl => (
                  <option key={tpl} value={tpl}>{tpl}</option>
                ))}
              </select>
              
              <textarea
                value={node.description || ''}
                onChange={(e) => updateNode(index, { description: e.target.value })}
                className="w-full text-sm border rounded px-2 py-1"
                rows={2}
                placeholder="Step description..."
              />
            </div>
          </div>
        ))}
        
        {nodes.length === 0 && (
          <div className="text-center py-4 text-zinc-500">
            <div className="text-lg mb-1">🔗</div>
            <div className="text-sm">No steps defined. Add steps to build your scenario.</div>
          </div>
        )}
      </div>
    </div>
  );
}