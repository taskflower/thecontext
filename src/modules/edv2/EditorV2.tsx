// ========================================
// src/modules/edv2/EditorV2.tsx
// ========================================
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useConfig } from '@/core/engine';
import { configDB } from '@/db';
import { parsePath } from './shared/editorUtils';
import WorkspaceEditor from './workspace/WorkspaceEditor';
import ScenarioEditor from './scenario/ScenarioEditor';
import { Breadcrumbs } from './shared/Breadcrumbs';

interface EditorV2Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditorV2({ isOpen, onClose }: EditorV2Props) {
  const { config, workspace, scenario, step, id } = useParams();
  const location = useLocation();
  
  const pathParams = parsePath(location.pathname);
  const cfgName = config || pathParams.config;
  const wsName = workspace || pathParams.workspace;
  const currentScenario = scenario || pathParams.scenario;
  
  const editMode = currentScenario ? 'scenario' : 'workspace';
  
  // Config paths - ALWAYS define both to maintain hook order
  const workspaceConfigPath = `/src/_configs/${cfgName}/workspaces/${wsName}.json`;
  const scenarioConfigPath = `/src/_configs/${cfgName}/scenarios/${wsName}/${currentScenario || 'default'}.json`;
  
  // Load configs - ALWAYS call both hooks to maintain hook order
  const workspaceConfig = useConfig<any>(cfgName, workspaceConfigPath);
  const scenarioConfig = useConfig<any>(cfgName, scenarioConfigPath);
  
  const [editConfig, setEditConfig] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  // Set config based on mode
  useEffect(() => {
    // Only use scenario config if we're actually in scenario mode and have scenario name
    if (editMode === 'scenario' && currentScenario && scenarioConfig) {
      setEditConfig({ ...scenarioConfig });
    } else if (editMode === 'workspace' && workspaceConfig) {
      setEditConfig({ ...workspaceConfig });
    } else {
      setEditConfig(null);
    }
  }, [workspaceConfig, scenarioConfig, editMode, currentScenario]);

  const saveConfig = async () => {
    if (!editConfig) return;
    setSaving(true);
    try {
      const configPath = editMode === 'scenario' && currentScenario
        ? `/src/_configs/${cfgName}/scenarios/${wsName}/${currentScenario}.json`
        : workspaceConfigPath;
      
      const configId = `${cfgName}:${configPath}`;
        
      await configDB.records.put({
        id: configId,
        data: editConfig,
        updatedAt: new Date()
      });
      window.location.reload();
    } catch (error) {
      alert('Save failed');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
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

      <Breadcrumbs 
        cfgName={cfgName}
        wsName={wsName}
        currentScenario={currentScenario}
        currentStep={pathParams.step}
        currentId={pathParams.id}
        pathname={location.pathname}
      />

      {editConfig ? (
        <>
          <div className="p-4">
            {editMode === 'scenario' ? (
              <ScenarioEditor 
                config={editConfig} 
                onChange={setEditConfig} 
              />
            ) : (
              <WorkspaceEditor 
                config={editConfig} 
                onChange={setEditConfig} 
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
            ? 'Loading scenario configuration...' 
            : 'Loading workspace configuration...'
          }
        </div>
      )}
    </div>
  );
} 
