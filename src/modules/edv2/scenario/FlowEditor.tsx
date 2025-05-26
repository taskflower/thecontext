// src/modules/edv2/scenario/FlowEditor.tsx
import { useState } from 'react';
import { useLlmEngine } from '@/core/engine';
import { z } from 'zod';

interface FlowEditorProps {
  flow: any;
  nodes: any[];
  onChange: (flow: any) => void;
}

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

export function FlowEditor({ flow, nodes, onChange }: FlowEditorProps) {
  const [prompt, setPrompt] = useState('');

  const { isLoading, result, start } = useLlmEngine({
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
    },
    userMessage: `Generate flow logic for nodes: ${nodes.map(n => n.slug).join(', ')}. ${prompt}`,
    systemMessage: 'Generate flow transitions between steps. Define entry point and transitions (onSuccess, onError, onCancel).'
  });

  const updateFlow = (updates: any) => {
    onChange({ ...flow, ...updates });
  };

  const addTransition = (fromNode: string) => {
    const newTransitions = {
      ...flow.transitions,
      [fromNode]: {
        onSuccess: '',
        onError: '',
        onCancel: '',
        ...(flow.transitions?.[fromNode] || {})
      }
    };
    onChange({ ...flow, transitions: newTransitions });
  };

  const updateTransition = (fromNode: string, type: string, target: string) => {
    const newTransitions = {
      ...flow.transitions,
      [fromNode]: {
        ...flow.transitions?.[fromNode],
        [type]: target
      }
    };
    onChange({ ...flow, transitions: newTransitions });
  };

  const removeTransition = (fromNode: string) => {
    const newTransitions = { ...flow.transitions };
    delete newTransitions[fromNode];
    onChange({ ...flow, transitions: newTransitions });
  };

  const targetOptions = [
    { value: '', label: 'Select target...' },
    { value: '@exit', label: 'Exit scenario' },
    { value: '@back', label: 'Go back' },
    { value: '@stay', label: 'Stay on current' },
    ...nodes.map(node => ({ 
      value: node.slug, 
      label: `Go to ${node.label}` 
    }))
  ];

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-indigo-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe flow logic (e.g., 'After create success go to view, on error stay, cancel returns to list')"
          className="w-full text-sm border rounded p-2 mb-2"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={() => start()}
            disabled={isLoading || !prompt.trim()}
            className="text-xs bg-indigo-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate Flow'}
          </button>
          {result && (
            <button
              onClick={() => onChange({ ...flow, ...result.flow })}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded"
            >
              Apply Flow
            </button>
          )}
        </div>
      </div>

      {/* Entry Point */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700">Entry Point</label>
        <select
          value={flow.entryPoint || ''}
          onChange={(e) => updateFlow({ entryPoint: e.target.value })}
          className="w-full text-sm border rounded px-2 py-1"
        >
          <option value="">Select entry point...</option>
          {nodes.map(node => (
            <option key={node.slug} value={node.slug}>{node.label} ({node.slug})</option>
          ))}
        </select>
      </div>

      {/* Transitions */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-zinc-700">Flow Transitions</h4>
          <select
            onChange={(e) => {
              if (e.target.value) {
                addTransition(e.target.value);
                e.target.value = '';
              }
            }}
            className="text-xs border rounded px-2 py-1"
          >
            <option value="">Add transition for...</option>
            {nodes.filter(node => !flow.transitions?.[node.slug]).map(node => (
              <option key={node.slug} value={node.slug}>{node.label}</option>
            ))}
          </select>
        </div>

        {Object.entries(flow.transitions || {}).map(([fromNode, transition]: [string, any]) => {
          const node = nodes.find(n => n.slug === fromNode);
          return (
            <div key={fromNode} className="border rounded p-3">
              <div className="flex justify-between items-center mb-3">
                <h5 className="text-sm font-medium">
                  From: {node?.label || fromNode}
                </h5>
                <button
                  onClick={() => removeTransition(fromNode)}
                  className="text-red-600 text-xs"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                {['onSuccess', 'onError', 'onCancel'].map(transitionType => (
                  <div key={transitionType}>
                    <label className="text-xs text-zinc-600 capitalize">
                      {transitionType.replace('on', 'On ')}
                    </label>
                    <select
                      value={transition[transitionType] || ''}
                      onChange={(e) => updateTransition(fromNode, transitionType, e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1 mt-1"
                    >
                      {targetOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        
        {Object.keys(flow.transitions || {}).length === 0 && (
          <div className="text-center py-4 text-zinc-500">
            <div className="text-lg mb-1">🔄</div>
            <div className="text-sm">No transitions defined. Add transitions to connect steps.</div>
          </div>
        )}
      </div>

      {/* Flow Visualization */}
      {nodes.length > 0 && (
        <div className="bg-zinc-50 p-3 rounded">
          <h4 className="text-sm font-medium text-zinc-700 mb-2">Flow Preview</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">START</span>
              <span>→</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {flow.entryPoint ? nodes.find(n => n.slug === flow.entryPoint)?.label : 'No entry point'}
              </span>
            </div>
            
            {Object.entries(flow.transitions || {}).map(([fromNode, transition]: [string, any]) => {
              const fromLabel = nodes.find(n => n.slug === fromNode)?.label || fromNode;
              return (
                <div key={fromNode} className="ml-4 space-y-1">
                  {Object.entries(transition).map(([type, target]: [string, any]) => {
                    if (!target) return null;
                    const targetLabel = target.startsWith('@') 
                      ? target 
                      : nodes.find(n => n.slug === target)?.label || target;
                    return (
                      <div key={type} className="flex items-center gap-2 text-xs">
                        <span className="bg-zinc-200 text-zinc-700 px-2 py-1 rounded">{fromLabel}</span>
                        <span className="text-zinc-500">{type}</span>
                        <span>→</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">{targetLabel}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}