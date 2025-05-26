// ========================================
// src/modules/edv2/workspace/WidgetEditor.tsx
// ========================================
import { AIGeneratorSection } from '../shared/AIGeneratorSection';
import { ItemList } from '../shared/ItemList';
import { createDefaultWidget } from '../shared/editorUtils';
import { WIDGET_TYPES } from '../shared/editorConfigs';

interface WidgetEditorProps {
  widgets: any[];
  onChange: (widgets: any[]) => void;
}

export function WidgetEditor({ widgets, onChange }: WidgetEditorProps) {
  const addWidget = (type: string) => {
    onChange([...widgets, createDefaultWidget(type)]);
  };

  const removeWidget = (index: number) => {
    onChange(widgets.filter((_, i) => i !== index));
  };

  const updateWidget = (index: number, updates: any) => {
    const newWidgets = [...widgets];
    newWidgets[index] = { ...newWidgets[index], ...updates };
    onChange(newWidgets);
  };

  const renderWidget = (widget: any, index: number) => (
    <>
      <span className="text-sm font-medium">{widget.tplFile}</span>
      <input
        value={widget.title}
        onChange={(e) => updateWidget(index, { title: e.target.value })}
        className="w-full text-sm border rounded px-2 py-1 mb-2 mt-2"
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
    </>
  );

  return (
    <div className="space-y-4">
      <AIGeneratorSection
        type="widgets"
        onApply={(result) => onChange([...widgets, ...result.widgets])}
        bgColor="bg-blue-50"
      />

      <div className="flex gap-2">
        {WIDGET_TYPES.map(type => (
          <button
            key={type}
            onClick={() => addWidget(type)}
            className="text-xs bg-zinc-100 px-2 py-1 rounded"
          >
            +{type.replace('Widget', '')}
          </button>
        ))}
      </div>

      <ItemList
        items={widgets}
        onAdd={() => {}} // Handled by buttons above
        onRemove={removeWidget}
        onUpdate={updateWidget}
        renderItem={renderWidget}
        addButtonText=""
        emptyMessage="No widgets defined. Add widgets to build your workspace."
        emptyIcon="🧩"
      />
    </div>
  );
}