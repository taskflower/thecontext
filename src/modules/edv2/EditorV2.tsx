// src/modules/edv2/EditorV2.tsx - Main sidebar editor with breadcrumbs
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useConfig, useLlmEngine } from '@/core/engine';
import { configDB } from '@/db';
import { z } from 'zod';

interface EditorV2Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditorV2({ isOpen, onClose }: EditorV2Props) {
  const { config, workspace, scenario, step, id } = useParams<{ 
    config: string; 
    workspace: string; 
    scenario?: string; 
    step?: string; 
    id?: string; 
  }>();
  const location = useLocation();
  
  // Fallback parsing from pathname if useParams fails
  const parsePathname = (pathname: string) => {
    const parts = pathname.split('/').filter(Boolean);
    return {
      config: parts[0] || 'exampleTicketApp',
      workspace: parts[1] || 'main',
      scenario: parts[2],
      step: parts[3],
      id: parts[4]
    };
  };
  
  const pathParams = parsePathname(location.pathname);
  const cfgName = config || pathParams.config;
  const wsName = workspace || pathParams.workspace;
  const currentScenario = scenario || pathParams.scenario;
  const currentStep = step || pathParams.step;
  const currentId = id || pathParams.id;
  
  // Create unique key for this workspace combination
  const workspaceKey = `${cfgName}:${wsName}`;
  
  // Debug logging
  console.log('EditorV2 params:', { 
    fromUseParams: { config, workspace, scenario, step, id },
    fromPathname: pathParams,
    final: { cfgName, wsName, currentScenario, currentStep, currentId },
    workspaceKey,
    pathname: location.pathname 
  });
  
  // Build the config path dynamically
  const configPath = `/src/_configs/${cfgName}/workspaces/${wsName}.json`;
  const workspaceConfig = useConfig<any>(cfgName, configPath);
  
  const [editConfig, setEditConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'widgets' | 'schema'>('widgets');
  const [saving, setSaving] = useState(false);

  // Simple effect - just load the config when it's available
  useEffect(() => {
    if (workspaceConfig) {
      console.log('Setting editConfig for workspace:', workspaceKey, workspaceConfig);
      setEditConfig({ ...workspaceConfig });
    } else {
      console.log('No workspaceConfig yet for:', workspaceKey);
      setEditConfig(null);
    }
  }, [workspaceConfig, workspaceKey]);

  const saveConfig = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      await configDB.records.put({
        id: `${cfgName}:/src/_configs/${cfgName}/workspaces/${wsName}.json`,
        data: editConfig,
        updatedAt: new Date()
      });
      window.location.reload(); // Refresh to see changes
    } catch (error) {
      alert('Save failed');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  // Generate breadcrumbs based on current route
  const getBreadcrumbs = () => {
    const breadcrumbs = [];
    
    // Always start with config
    breadcrumbs.push({ label: cfgName, path: `/${cfgName}` });
    
    // Add workspace
    if (wsName) {
      breadcrumbs.push({ 
        label: wsName, 
        path: `/${cfgName}/${wsName}` 
      });
    }
    
    // Add scenario if present
    if (currentScenario) {
      breadcrumbs.push({ 
        label: `📋 ${currentScenario}`, 
        path: `/${cfgName}/${wsName}/${currentScenario}` 
      });
    }
    
    // Add step if present
    if (currentStep) {
      breadcrumbs.push({ 
        label: `📝 ${currentStep}`, 
        path: `/${cfgName}/${wsName}/${currentScenario}/${currentStep}` 
      });
    }
    
    // Add ID if present (form view)
    if (currentId) {
      breadcrumbs.push({ 
        label: `🎫 #${currentId}`, 
        path: location.pathname 
      });
    }
    
    return breadcrumbs;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white border-r border-zinc-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
        <h2 className="font-semibold">⚙️ Editor V2</h2>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">✕</button>
      </div>

      {/* Breadcrumbs */}
      <div className="px-4 py-2 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center space-x-1 text-sm">
          {getBreadcrumbs().map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && (
                <svg className="w-3 h-3 text-zinc-400 mx-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              <span 
                className={`${
                  index === getBreadcrumbs().length - 1 
                    ? 'text-zinc-900 font-medium' 
                    : 'text-zinc-600 hover:text-zinc-900 cursor-pointer'
                }`}
                onClick={() => {
                  if (index < getBreadcrumbs().length - 1) {
                    window.open(crumb.path, '_blank');
                  }
                }}
              >
                {crumb.label}
              </span>
            </div>
          ))}
        </div>
        
        {/* Current path info and workspace indicator */}
        <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
          <span>{location.pathname}</span>
          <span className="bg-zinc-200 px-2 py-1 rounded" key={`${cfgName}-${wsName}`}>
            Editing: {cfgName}/{wsName}
          </span>
        </div>
      </div>

      {editConfig ? (
        <>
          <div className="p-4">
            <div className="flex border-b border-zinc-200 mb-4">
              {[
                { id: 'widgets', label: '🧩 Widgets' },
                { id: 'schema', label: '📄 Schema' }
              ].map(tab => (
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
                widgets={editConfig.templateSettings?.widgets || []}
                onChange={(widgets) => setEditConfig({
                  ...editConfig,
                  templateSettings: { ...editConfig.templateSettings, widgets }
                })}
              />
            )}

            {activeTab === 'schema' && (
              <SchemaEditor
                schema={editConfig.contextSchema || {}}
                onChange={(contextSchema) => setEditConfig({
                  ...editConfig,
                  contextSchema
                })}
              />
            )}
          </div>

          <div className="p-4 border-t border-zinc-200">
            <button
              onClick={saveConfig}
              disabled={saving}
              className="w-full bg-zinc-900 text-white py-2 px-4 rounded hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-zinc-500">
          {workspaceConfig ? 'Loading workspace...' : 'Loading configuration...'}
        </div>
      )}
    </div>
  );
}

// Simplified Widget Editor
function WidgetEditor({ widgets, onChange }: { widgets: any[], onChange: (widgets: any[]) => void }) {
  const [prompt, setPrompt] = useState('');

  const widgetSchema = z.object({
    widgets: z.array(z.object({
      tplFile: z.enum(['ButtonWidget', 'InfoWidget', 'TitleWidget']),
      title: z.string(),
      attrs: z.record(z.any())
    }))
  });

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
    const newWidget = {
      tplFile: type,
      title: `New ${type.replace('Widget', '')}`,
      attrs: type === 'ButtonWidget' 
        ? { navPath: '', variant: 'default', colSpan: '2' }
        : type === 'InfoWidget'
        ? { content: 'Content here', variant: 'default', colSpan: '3' }
        : { size: 'medium', colSpan: 'full' }
    };
    onChange([...widgets, newWidget]);
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

// Simplified Schema Editor
function SchemaEditor({ schema, onChange }: { schema: any, onChange: (schema: any) => void }) {
  const [prompt, setPrompt] = useState('');
  const [newSchemaKey, setNewSchemaKey] = useState('');

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