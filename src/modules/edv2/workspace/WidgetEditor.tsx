// src/modules/edv2/workspace/WidgetEditor.tsx
import { useState } from 'react';
import { useLlmEngine } from '@/core/engine';
import { z } from 'zod';

interface WidgetEditorProps {
  widgets: any[];
  onChange: (widgets: any[]) => void;
}

const widgetSchema = z.object({
  widgets: z.array(z.object({
    tplFile: z.enum(['ButtonWidget', 'InfoWidget', 'TitleWidget']),
    title: z.string(),
    attrs: z.record(z.any())
  }))
});

export function WidgetEditor({ widgets, onChange }: WidgetEditorProps) {
  const [prompt, setPrompt] = useState('');

  const { isLoading, result, start } = useLlmEngine({
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
    },
    userMessage: prompt,
    systemMessage: 'Generate widgets based on description. Use ButtonWidget for navigation, InfoWidget for info panels, TitleWidget for headers.'
  });

  const addWidget = (type: string) => {
    const attrs = type === 'ButtonWidget' 
      ? { navPath: '', variant: 'default', colSpan: '2' }
      : type === 'InfoWidget'
      ? { content: 'Content here', variant: 'default', colSpan: '3' }
      : { size: 'medium', colSpan: 'full' };

    onChange([...widgets, {
      tplFile: type,
      title: `New ${type.replace('Widget', '')}`,
      attrs
    }]);
  };

  const removeWidget = (index: number) => {
    onChange(widgets.filter((_, i) => i !== index));
  };

  const updateWidget = (index: number, updates: any) => {
    const newWidgets = [...widgets];
    newWidgets[index] = { ...newWidgets[index], ...updates };
    onChange(newWidgets);
  };

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-blue-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe widgets to generate..."
          className="w-full text-sm border rounded p-2 mb-2"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={() => start()}
            disabled={isLoading || !prompt.trim()}
            className="text-xs bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
          >
            {isLoading ? 'Generating...' : 'Generate'}
          </button>
          {result && (
            <button
              onClick={() => onChange([...widgets, ...result.widgets])}
              className="text-xs bg-green-600 text-white px-3 py-1 rounded"
            >
              Add Generated
            </button>
          )}
        </div>
      </div>

      {/* Manual Add */}
      <div className="flex gap-2">
        {['ButtonWidget', 'InfoWidget', 'TitleWidget'].map(type => (
          <button
            key={type}
            onClick={() => addWidget(type)}
            className="text-xs bg-zinc-100 px-2 py-1 rounded"
          >
            +{type.replace('Widget', '')}
          </button>
        ))}
      </div>

      {/* Widget List */}
      <div className="space-y-2">
        {widgets.map((widget, index) => (
          <div key={index} className="border rounded p-2">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium">{widget.tplFile}</span>
              <button
                onClick={() => removeWidget(index)}
                className="text-red-600 text-xs"
              >
                Remove
              </button>
            </div>
            <input
              value={widget.title}
              onChange={(e) => updateWidget(index, { title: e.target.value })}
              className="w-full text-sm border rounded px-2 py-1 mb-2"
              placeholder="Title"
            />
            {widget.tplFile === 'ButtonWidget' && (
              <input
                value={widget.attrs?.navPath || ''}
                onChange={(e) => updateWidget(index, { 
                  attrs: { ...widget.attrs, navPath: e.target.value }
                })}
                className="w-full text-sm border rounded px-2 py-1"
                placeholder="Navigation path"
              />
            )}
            {widget.tplFile === 'InfoWidget' && (
              <textarea
                value={widget.attrs?.content || ''}
                onChange={(e) => updateWidget(index, { 
                  attrs: { ...widget.attrs, content: e.target.value }
                })}
                className="w-full text-sm border rounded px-2 py-1"
                rows={2}
                placeholder="Content"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}