// src/modules/edv2/workspace/WorkspaceEditor.tsx
import { useState } from 'react';
import { WidgetEditor } from './WidgetEditor';
import { SchemaEditor } from '../shared/SchemaEditor';

interface WorkspaceEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export default function WorkspaceEditor({ config, onChange }: WorkspaceEditorProps) {
  const [activeTab, setActiveTab] = useState<'widgets' | 'schema'>('widgets');

  const tabs = [
    { id: 'widgets', label: '🧩 Widgets' },
    { id: 'schema', label: '📄 Schema' }
  ];

  return (
    <>
      <div className="flex border-b border-zinc-200 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-b-2 border-zinc-900 text-zinc-900'
                : 'text-zinc-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'widgets' && (
        <WidgetEditor 
          widgets={config.templateSettings?.widgets || []}
          onChange={(widgets) => onChange({
            ...config,
            templateSettings: { ...config.templateSettings, widgets }
          })}
        />
      )}

      {activeTab === 'schema' && (
        <SchemaEditor
          schema={config.contextSchema || {}}
          onChange={(contextSchema) => onChange({
            ...config,
            contextSchema
          })}
        />
      )}
    </>
  );
}