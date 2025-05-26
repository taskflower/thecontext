// src/modules/editor/components/WorkspaceEditor.tsx
import { useState, useEffect } from 'react';
import { useConfig } from '@/core/engine';
import { configDB } from '@/db';
import WidgetEditor from './WidgetEditor';
import ContextSchemaEditor from './ContextSchemaEditor';


interface WorkspaceConfig {
  slug?: string;
  name: string;
  templateSettings: {
    layoutFile: string;
    widgets: any[];
  };
  contextSchema?: Record<string, any>;
}

interface WorkspaceEditorProps {
  configName: string;
  workspaceName: string;
}

export default function WorkspaceEditor({ configName, workspaceName }: WorkspaceEditorProps) {
  const configPath = `/src/_configs/${configName}/workspaces/${workspaceName}.json`;
  const originalConfig = useConfig<WorkspaceConfig>(configName, configPath);
  const [config, setConfig] = useState<WorkspaceConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'widgets' | 'schema'>('basic');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (originalConfig) {
      setConfig({ ...originalConfig });
    }
  }, [originalConfig]);

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await configDB.records.put({
        id: `${configName}:${configPath}`,
        data: config,
        updatedAt: new Date()
      });
      alert('Configuration saved!');
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (!config) return <div>Loading workspace config...</div>;

  const tabs = [
    { id: 'basic', label: '⚙️ Basic Settings' },
    { id: 'widgets', label: '🧩 Widgets' },
    { id: 'schema', label: '📄 Context Schema' }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-zinc-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-zinc-200">
        {activeTab === 'basic' && (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Workspace Name
              </label>
              <input
                type="text"
                value={config.name}
                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Layout File
              </label>
              <select
                value={config.templateSettings.layoutFile}
                onChange={(e) => setConfig({
                  ...config,
                  templateSettings: {
                    ...config.templateSettings,
                    layoutFile: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-900/20"
              >
                <option value="Simple">Simple</option>
                <option value="UniversalLayout">Universal Layout</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'widgets' && (
          <WidgetEditor
            widgets={config.templateSettings.widgets}
            onChange={(widgets) => setConfig({
              ...config,
              templateSettings: {
                ...config.templateSettings,
                widgets
              }
            })}
          />
        )}

        {activeTab === 'schema' && (
          <ContextSchemaEditor
            schema={config.contextSchema || {}}
            onChange={(contextSchema) => setConfig({
              ...config,
              contextSchema
            })}
          />
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={saveConfig}
          disabled={saving}
          className="px-4 py-2 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>
    </div>
  );
}