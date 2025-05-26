// src/modules/edv2/scenario/ScenarioEditor.tsx
import { useState } from 'react';
import { NodesEditor } from './NodesEditor';
import { FlowEditor } from './FlowEditor';
import { SchemaEditor } from '../shared/SchemaEditor';

interface ScenarioEditorProps {
  config: any;
  onChange: (config: any) => void;
}

export default function ScenarioEditor({ config, onChange }: ScenarioEditorProps) {
  const [activeTab, setActiveTab] = useState<'nodes' | 'flow' | 'schema'>('nodes');

  const tabs = [
    { id: 'nodes', label: '🔗 Nodes & Steps' },
    { id: 'flow', label: '🔄 Flow Logic' },
    { id: 'schema', label: '📄 Data Schema' }
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

      {activeTab === 'nodes' && (
        <NodesEditor
          nodes={config.nodes || []}
          onChange={(nodes) => onChange({ ...config, nodes })}
        />
      )}

      {activeTab === 'flow' && (
        <FlowEditor
          flow={config.flow || {}}
          nodes={config.nodes || []}
          onChange={(flow) => onChange({ ...config, flow })}
        />
      )}

      {activeTab === 'schema' && (
        <SchemaEditor
          schema={config.contextSchema || {}}
          onChange={(contextSchema) => onChange({ ...config, contextSchema })}
        />
      )}
    </>
  );
}