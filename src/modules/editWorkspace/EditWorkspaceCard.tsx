// src/modules/editWorkspace/EditWorkspaceCard.tsx - Fixed save & compact design
import React, { useState, useEffect } from 'react';
import { Database, Edit3, X, TreePine } from 'lucide-react';
import { WorkspaceInfo } from '../appTree/hooks/useAppTree';
import SimpleSchemaEditor from '../simpleSchemaEditor/SimpleSchemaEditor';
import { configDB } from '@/provideDB';

interface EditWorkspaceCardProps {
  workspace: WorkspaceInfo;
  configName: string;
  onClose: () => void;
}

const EditWorkspaceCard: React.FC<EditWorkspaceCardProps> = ({
  workspace,
  configName,
  onClose,
}) => {
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);

  // Form states
  const [name, setName] = useState(workspace.name);
  const [description, setDescription] = useState('');
  const [layoutFile, setLayoutFile] = useState('Simple');

  useEffect(() => {
    loadWorkspaceData();
  }, [workspace, configName]);

  const loadWorkspaceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from configDB first
      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      const cachedData = await configDB.records.get(configKey);

      if (cachedData) {
        setWorkspaceData(cachedData.data);
        setName(cachedData.data.name || workspace.name);
        setDescription(cachedData.data.description || '');
        setLayoutFile(cachedData.data.templateSettings?.layoutFile || 'Simple');
      } else {
        // Try to load from file system
        try {
          const response = await fetch(`/src/_configs/${configName}/workspaces/${workspace.slug}.json`);
          if (response.ok) {
            const data = await response.json();
            setWorkspaceData(data);
            setName(data.name || workspace.name);
            setDescription(data.description || '');
            setLayoutFile(data.templateSettings?.layoutFile || 'Simple');
            
            // Cache the loaded data
            await configDB.records.put({
              id: configKey,
              data: data,
              updatedAt: new Date()
            });
          } else {
            throw new Error('File not found');
          }
        } catch (fetchError) {
          // Create default workspace data
          const defaultData = {
            slug: workspace.slug,
            name: workspace.name,
            templateSettings: {
              layoutFile: 'Simple',
              widgets: []
            },
            contextSchema: {}
          };
          setWorkspaceData(defaultData);
          setName(defaultData.name);
          setDescription('');
          setLayoutFile(defaultData.templateSettings.layoutFile);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nieznany błąd');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!workspaceData) return;
    
    setSaving(true);
    try {
      const updatedData = {
        ...workspaceData,
        name,
        description,
        templateSettings: {
          ...workspaceData.templateSettings,
          layoutFile
        }
      };

      const configKey = `${configName}:/src/_configs/${configName}/workspaces/${workspace.slug}.json`;
      
      await configDB.records.put({
        id: configKey,
        data: updatedData,
        updatedAt: new Date()
      });

      setWorkspaceData(updatedData);
      
      // Success animation
      const button = document.querySelector("#save-button") as HTMLButtonElement;
      if (button) {
        button.classList.add("animate-pulse");
        setTimeout(() => button.classList.remove("animate-pulse"), 500);
      }
      
      console.log('✅ Workspace saved successfully');
      
      // Close after short delay to show success
      setTimeout(() => {
        window.location.reload(); // Refresh to see changes
      }, 600);
      
    } catch (err) {
      console.error('Save error:', err);
      setError(err instanceof Error ? err.message : 'Błąd podczas zapisywania');
    } finally {
      setSaving(false);
    }
  };

  const handleSchemaChange = (newSchema: any) => {
    setWorkspaceData((prev: any) => ({
      ...prev,
      contextSchema: newSchema
    }));
  };

  const getSchemaStats = () => {
    if (!workspaceData?.contextSchema) return { schemas: 0, fields: 0 };
    
    const schemas = Object.keys(workspaceData.contextSchema).length;
    const fields = Object.values(workspaceData.contextSchema).reduce((total: number, schema: any) => {
      return total + Object.keys(schema.properties || {}).length;
    }, 0);
    
    return { schemas, fields };
  };

  if (loading) {
    return (
      <div className="fixed left-12 top-10 z-50 w-92 bg-white rounded-lg shadow-xl border border-zinc-200 h-[90vh] flex flex-col">
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
            <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
            <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const stats = getSchemaStats();

  return (
    <>
      {/* Main Edit Card */}
      <div className="fixed left-12 top-10 z-50 w-92 bg-white rounded-lg shadow-xl border border-zinc-200 h-[90vh] flex flex-col animate-in slide-in-from-left-2">
        {/* Header - Same style as AppTree */}
        <div className="p-3 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-zinc-900 flex items-center gap-1.5">
              <TreePine size={14} />
              Edit Workspace
            </h3>
            <p className="text-xs text-zinc-500 truncate">
              {workspace.slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 p-1 rounded hover:bg-zinc-100"
          >
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-1">
                📝 Basic Settings
              </h4>
              
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Workspace name"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Optional description..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Layout Template
                </label>
                <select
                  value={layoutFile}
                  onChange={(e) => setLayoutFile(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Simple">Simple</option>
                  <option value="UniversalLayout">Universal Layout</option>
                  <option value="Dashboard">Dashboard</option>
                  <option value="Minimal">Minimal</option>
                </select>
              </div>
            </div>

            {/* Schema Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-1">
                  <Database size={12} />
                  Data Schemas
                </h4>
                <button
                  onClick={() => setShowSchemaEditor(true)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
                >
                  <Edit3 size={10} />
                  Edit
                </button>
              </div>

              <div className="p-3 bg-zinc-50 rounded border">
                <div className="text-xs text-zinc-600 mb-2">
                  Schemas define data structure for forms in this workspace.
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{stats.schemas}</div>
                    <div className="text-xs text-zinc-500">schemas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{stats.fields}</div>
                    <div className="text-xs text-zinc-500">fields</div>
                  </div>
                </div>

                {stats.schemas > 0 ? (
                  <div className="space-y-1">
                    {Object.entries(workspaceData?.contextSchema || {}).map(([schemaName, schema]: [string, any]) => (
                      <div key={schemaName} className="flex items-center justify-between bg-white px-2 py-1.5 rounded text-xs">
                        <span className="font-medium">{schemaName}</span>
                        <span className="text-zinc-500">
                          {Object.keys(schema.properties || {}).length}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3">
                    <div className="text-zinc-400 text-xs mb-2">No schemas defined</div>
                    <button
                      onClick={() => setShowSchemaEditor(true)}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1 mx-auto"
                    >
                      <Database size={10} />
                      Add Schema
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Scenarios Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-zinc-900 flex items-center gap-1">
                📋 Scenarios ({workspace.scenarios.length})
              </h4>
              <div className="space-y-1">
                {workspace.scenarios.length > 0 ? (
                  workspace.scenarios.slice(0, 5).map(scenario => (
                    <div key={scenario.slug} className="p-2 bg-zinc-50 rounded text-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-zinc-500">{scenario.slug}</div>
                        </div>
                        <div className="text-zinc-400">
                          {scenario.nodes.length}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-zinc-400 italic p-2 bg-zinc-50 rounded">
                    No scenarios in this workspace
                  </div>
                )}
                {workspace.scenarios.length > 5 && (
                  <div className="text-xs text-zinc-400 text-center py-1">
                    ... and {workspace.scenarios.length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-zinc-200 bg-zinc-50 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-800 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSchemaEditor(true)}
              className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
              disabled={saving}
            >
              <Database size={10} />
              Schemas
            </button>
            <button
              id="save-button"
              onClick={handleSave}
              disabled={saving}
              className={`px-3 py-1.5 text-xs text-white rounded transition-all duration-200 flex items-center gap-1 ${
                saving
                  ? "bg-zinc-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {saving ? (
                <>
                  <svg
                    className="animate-spin h-3 w-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Simple Schema Editor */}
      {showSchemaEditor && workspaceData && (
        <SimpleSchemaEditor
          schema={workspaceData.contextSchema || {}}
          onSchemaChange={handleSchemaChange}
          onClose={() => setShowSchemaEditor(false)}
          title="Schema Editor"
          workspaceName={workspace.name}
        />
      )}
    </>
  );
};

export default EditWorkspaceCard;