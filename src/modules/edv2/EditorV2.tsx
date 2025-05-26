// src/modules/edv2/EditorV2.tsx - Rozszerzony o edycję scenariuszy
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
  
  // Determine what we're editing based on current path
  const editMode = currentScenario ? 'scenario' : 'workspace';
  
  // Create unique key for this workspace/scenario combination
  const workspaceKey = `${cfgName}:${wsName}`;
  const scenarioKey = currentScenario ? `${cfgName}:${wsName}:${currentScenario}` : null;
  
  // Build the config paths dynamically - ALWAYS define both paths
  const workspaceConfigPath = `/src/_configs/${cfgName}/workspaces/${wsName}.json`;
  const scenarioConfigPath = `/src/_configs/${cfgName}/scenarios/${wsName}/${currentScenario || 'default'}.json`;
  
  // ALWAYS call both hooks to maintain hook order
  const workspaceConfig = useConfig<any>(cfgName, workspaceConfigPath);
  const scenarioConfig = useConfig<any>(cfgName, currentScenario ? scenarioConfigPath : null);
  
  const [editConfig, setEditConfig] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'widgets' | 'schema' | 'nodes' | 'flow'>('widgets');
  const [saving, setSaving] = useState(false);

  // Load appropriate config based on edit mode
  useEffect(() => {
    if (editMode === 'scenario' && currentScenario && scenarioConfig) {
      console.log('Setting editConfig for scenario:', scenarioKey, scenarioConfig);
      setEditConfig({ ...scenarioConfig });
      setActiveTab('nodes');
    } else if (editMode === 'workspace' && workspaceConfig) {
      console.log('Setting editConfig for workspace:', workspaceKey, workspaceConfig);
      setEditConfig({ ...workspaceConfig });
      setActiveTab('widgets');
    } else {
      console.log('No config yet for:', editMode, workspaceKey, scenarioKey);
      setEditConfig(null);
    }
  }, [workspaceConfig, scenarioConfig, editMode, workspaceKey, scenarioKey, currentScenario]);

  const saveConfig = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      let configId: string;
      let configPath: string;
      
      if (editMode === 'scenario' && currentScenario) {
        configPath = `/src/_configs/${cfgName}/scenarios/${wsName}/${currentScenario}.json`;
        configId = `${cfgName}:${configPath}`;
      } else {
        configPath = workspaceConfigPath;
        configId = `${cfgName}:${configPath}`;
      }
        
      await configDB.records.put({
        id: configId,
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

  // Get appropriate tabs based on edit mode
  const getTabs = () => {
    if (editMode === 'scenario') {
      return [
        { id: 'nodes', label: '🔗 Nodes & Steps' },
        { id: 'flow', label: '🔄 Flow Logic' },
        { id: 'schema', label: '📄 Data Schema' }
      ];
    } else {
      return [
        { id: 'widgets', label: '🧩 Widgets' },
        { id: 'schema', label: '📄 Schema' }
      ];
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-96 bg-white border-r border-zinc-200 shadow-lg z-50 overflow-y-auto">
      <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
        <h2 className="font-semibold">
          ⚙️ Editor V2 {editMode === 'scenario' ? '(Scenario)' : '(Workspace)'}
        </h2>
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
        
        {/* Current path info and editing indicator */}
        <div className="flex justify-between items-center text-xs text-zinc-500 mt-1">
          <span>{location.pathname}</span>
          <span className="bg-zinc-200 px-2 py-1 rounded" key={`${cfgName}-${wsName}-${currentScenario || 'workspace'}`}>
            Editing: {editMode === 'scenario' ? `${wsName}/${currentScenario}` : `${cfgName}/${wsName}`}
          </span>
        </div>
      </div>

      {editConfig ? (
        <>
          <div className="p-4">
            <div className="flex border-b border-zinc-200 mb-4">
              {getTabs().map(tab => (
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

            {/* Workspace Tabs */}
            {editMode === 'workspace' && activeTab === 'widgets' && (
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

            {/* Scenario Tabs */}
            {editMode === 'scenario' && activeTab === 'nodes' && (
              <NodesEditor
                nodes={editConfig.nodes || []}
                onChange={(nodes) => setEditConfig({
                  ...editConfig,
                  nodes
                })}
              />
            )}

            {editMode === 'scenario' && activeTab === 'flow' && (
              <FlowEditor
                flow={editConfig.flow || {}}
                nodes={editConfig.nodes || []}
                onChange={(flow) => setEditConfig({
                  ...editConfig,
                  flow
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
              {saving ? 'Saving...' : `Save ${editMode === 'scenario' ? 'Scenario' : 'Workspace'}`}
            </button>
          </div>
        </>
      ) : (
        <div className="p-4 text-center text-zinc-500">
          {editMode === 'scenario' 
            ? (scenarioConfig ? 'Loading scenario...' : 'Loading scenario configuration...') 
            : (workspaceConfig ? 'Loading workspace...' : 'Loading workspace configuration...')
          }
        </div>
      )}
    </div>
  );
}

// Existing WidgetEditor component (unchanged)
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

// Existing SchemaEditor component (unchanged)
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

// NEW: NodesEditor component for scenario editing
function NodesEditor({ nodes, onChange }: { nodes: any[], onChange: (nodes: any[]) => void }) {
  const [prompt, setPrompt] = useState('');
  const [newNodeSlug, setNewNodeSlug] = useState('');

  const nodeGenerationSchema = z.object({
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

  const { isLoading, result, start } = useLlmEngine({
    schema: nodeGenerationSchema,
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
    const newNode = {
      slug: newNodeSlug,
      label: newNodeSlug.charAt(0).toUpperCase() + newNodeSlug.slice(1),
      tplFile: 'ListTemplate',
      order: nodes.length + 1,
      description: '',
      validations: [],
      handlers: {}
    };
    onChange([...nodes, newNode]);
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
    
    // Update order numbers
    newNodes.forEach((node, i) => {
      node.order = i + 1;
    });
    
    onChange(newNodes);
  };

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-purple-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe scenario steps to generate (e.g., 'Create a ticket management workflow with list, create, edit, and delete steps')"
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
          placeholder="Step slug (e.g., 'list', 'create', 'edit')"
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
                <option value="ListTemplate">List Template</option>
                <option value="CreateTemplate">Create Template</option>
                <option value="EditTemplate">Edit Template</option>
                <option value="ViewTemplate">View Template</option>
                <option value="DeleteTemplate">Delete Template</option>
                <option value="FormTemplate">Form Template</option>
                <option value="SearchTemplate">Search Template</option>
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

// NEW: FlowEditor component for scenario flow logic
function FlowEditor({ flow, nodes, onChange }: { flow: any, nodes: any[], onChange: (flow: any) => void }) {
  const [prompt, setPrompt] = useState('');

  const flowGenerationSchema = z.object({
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

  const { isLoading, result, start } = useLlmEngine({
    schema: flowGenerationSchema,
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
    userMessage: `Generate flow logic for scenario with these nodes: ${nodes.map(n => n.slug).join(', ')}. ${prompt}`,
    systemMessage: 'Generate flow transitions between scenario steps. Define entry point and transitions (onSuccess, onError, onCancel) between nodes.'
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

  return (
    <div className="space-y-4">
      {/* AI Generation */}
      <div className="bg-indigo-50 p-3 rounded">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe flow logic (e.g., 'After successful create, go to view. On error, stay on create. Cancel returns to list')"
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
                      <option value="">Select target...</option>
                      <option value="@exit">Exit scenario</option>
                      <option value="@back">Go back</option>
                      <option value="@stay">Stay on current</option>
                      {nodes.map(targetNode => (
                        <option key={targetNode.slug} value={targetNode.slug}>
                          Go to {targetNode.label}
                        </option>
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
            <div className="text-sm">No transitions defined. Add transitions to connect your steps.</div>
          </div>
        )}
      </div>

      {/* Flow Visualization */}
      {nodes.length > 0 && (
        <div className="bg-zinc-50 p-3 rounded">
          <h4 className="text-sm font-medium text-zinc-700 mb-2">Flow Visualization</h4>
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