// src/modules/appTree/components/AppTreeView.tsx - Vite import.meta.glob version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '@/core';

interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
  workspaces?: string[];
}

interface WorkspaceInfo {
  slug: string;
  name: string;
  scenarios: ScenarioInfo[];
}

interface ScenarioInfo {
  slug: string;
  name: string;
  nodes: NodeInfo[];
}

interface NodeInfo {
  slug: string;
  label: string;
  order: number;
  tplFile: string;
}

interface AppTreeViewProps {
  configName: string;
  onNavigate?: () => void;
}

const AppTreeView: React.FC<AppTreeViewProps> = ({ configName, onNavigate }) => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(new Set());
  const [expandedScenarios, setExpandedScenarios] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const appConfig = useConfig<AppConfig>(
    configName,
    `/src/_configs/${configName}/app.json`
  );

  useEffect(() => {
    if (!appConfig) return;
    loadWorkspacesAndScenarios();
  }, [appConfig, configName]);

  const loadWorkspacesAndScenarios = async () => {
    try {
      setLoading(true);
      const workspaceList: WorkspaceInfo[] = [];

      // ONLY use workspaces explicitly listed in app.json
      if (!appConfig?.workspaces) {
        console.warn('No workspaces defined in app.json');
        setWorkspaces([]);
        return;
      }

      console.log('Loading workspaces from app.json:', appConfig.workspaces);

      for (const workspaceSlug of appConfig.workspaces) {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/workspaces/${workspaceSlug}.json`
          );
          if (!response.ok) {
            console.warn(`Workspace ${workspaceSlug} listed in app.json but file not found`);
            continue;
          }

          const workspaceConfig = await response.json();
          const scenarios = await discoverScenariosForWorkspace(workspaceSlug);

          workspaceList.push({
            slug: workspaceSlug,
            name: workspaceConfig.name || workspaceSlug,
            scenarios,
          });
          
          console.log(`Loaded workspace: ${workspaceSlug} with ${scenarios.length} scenarios`);
        } catch (error) {
          console.warn(`Failed to load workspace ${workspaceSlug}:`, error);
          continue;
        }
      }

      setWorkspaces(workspaceList);
      
      // Auto-expand first workspace
      if (workspaceList.length > 0) {
        setExpandedWorkspaces(new Set([workspaceList[0].slug]));
      }
    } catch (error) {
      console.error('Failed to load workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const discoverScenariosForWorkspace = async (workspaceSlug: string): Promise<ScenarioInfo[]> => {
    const scenarios: ScenarioInfo[] = [];
    
    console.log(`Discovering scenarios for workspace: ${workspaceSlug}`);

    try {
      // Use Vite's import.meta.glob to discover scenario files at build time
      // This pattern will match all .json files in the specific workspace scenarios folder
      const scenarioModules = import.meta.glob(`/src/_configs/**/scenarios/*/**.json`, { as: 'url' });
      
      console.log('All discovered scenario files:', Object.keys(scenarioModules));
      
      // Filter for this specific config and workspace
      const workspaceScenarioPattern = `/src/_configs/${configName}/scenarios/${workspaceSlug}/`;
      const workspaceScenarios = Object.keys(scenarioModules)
        .filter(path => path.startsWith(workspaceScenarioPattern))
        .map(path => {
          const filename = path.replace(workspaceScenarioPattern, '').replace('.json', '');
          return filename;
        });

      console.log(`Found scenario files for ${workspaceSlug}:`, workspaceScenarios);

      // Load each discovered scenario
      for (const scenarioSlug of workspaceScenarios) {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/scenarios/${workspaceSlug}/${scenarioSlug}.json`
          );
          if (response.ok) {
            const scenarioConfig = await response.json();
            scenarios.push({
              slug: scenarioSlug,
              name: scenarioConfig.name || scenarioConfig.slug || scenarioSlug,
              nodes: scenarioConfig.nodes || [],
            });
            console.log(`✓ Loaded scenario: ${workspaceSlug}/${scenarioSlug}`);
          }
        } catch (error) {
          console.warn(`Failed to load scenario ${workspaceSlug}/${scenarioSlug}:`, error);
        }
      }
    } catch (error) {
      console.warn('Vite glob discovery failed, falling back to pattern matching:', error);
      
      // Fallback to pattern matching if glob fails
      const commonScenarioNames = [
        'dashboard', 'list', 'create', 'edit', 'view', 'delete', 'respond', 
        'login', 'register', 'logout', 'profile', 'settings'
      ];

      for (const scenarioName of commonScenarioNames) {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/scenarios/${workspaceSlug}/${scenarioName}.json`
          );
          if (response.ok) {
            const scenarioConfig = await response.json();
            scenarios.push({
              slug: scenarioName,
              name: scenarioConfig.name || scenarioConfig.slug || scenarioName,
              nodes: scenarioConfig.nodes || [],
            });
            console.log(`✓ Found scenario: ${workspaceSlug}/${scenarioName}`);
          }
        } catch (error) {
          // Expected for non-existent files
        }
      }
    }

    console.log(`Total scenarios found for ${workspaceSlug}: ${scenarios.length}`);

    // Sort scenarios in logical order
    return scenarios.sort((a, b) => {
      const order = ['dashboard', 'list', 'create', 'edit', 'view', 'delete', 'respond', 'login', 'register'];
      const aIndex = order.indexOf(a.slug);
      const bIndex = order.indexOf(b.slug);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.slug.localeCompare(b.slug);
    });
  };

  const toggleWorkspace = (workspaceSlug: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceSlug)) {
      newExpanded.delete(workspaceSlug);
    } else {
      newExpanded.add(workspaceSlug);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const toggleScenario = (scenarioKey: string) => {
    const newExpanded = new Set(expandedScenarios);
    if (newExpanded.has(scenarioKey)) {
      newExpanded.delete(scenarioKey);
    } else {
      newExpanded.add(scenarioKey);
    }
    setExpandedScenarios(newExpanded);
  };

  const navigateToWorkspace = (workspaceSlug: string) => {
    navigate(`/${configName}/${workspaceSlug}`);
    onNavigate?.();
  };

  const navigateToScenario = (workspaceSlug: string, scenarioSlug: string) => {
    navigate(`/${configName}/${workspaceSlug}/${scenarioSlug}`);
    onNavigate?.();
  };

  const getScenarioKey = (workspaceSlug: string, scenarioSlug: string) => 
    `${workspaceSlug}:${scenarioSlug}`;

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* App Info */}
      <div className="p-4 bg-zinc-50 border-b border-zinc-200">
        <div className="text-sm text-zinc-600">
          <strong>{appConfig?.name || configName}</strong>
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          Theme: {appConfig?.tplDir || 'default'}
        </div>
        {appConfig?.workspaces && (
          <div className="text-xs text-zinc-400 mt-1">
            Workspaces: {appConfig.workspaces.join(', ')}
          </div>
        )}
      </div>

      {/* Tree Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {workspaces.map((workspace) => (
            <div key={workspace.slug}>
              {/* Workspace */}
              <div className="flex items-center group">
                <button
                  onClick={() => toggleWorkspace(workspace.slug)}
                  className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-zinc-100 rounded-md min-w-0"
                >
                  <span className="text-zinc-400 flex-shrink-0">
                    {expandedWorkspaces.has(workspace.slug) ? '📂' : '📁'}
                  </span>
                  <span className="font-medium text-zinc-900 truncate">
                    {workspace.name}
                  </span>
                  <span className="text-zinc-400 text-xs flex-shrink-0">
                    ({workspace.scenarios.length})
                  </span>
                </button>

                <button
                  onClick={() => navigateToWorkspace(workspace.slug)}
                  className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                >
                  Open
                </button>
              </div>

              {/* Scenarios */}
              {expandedWorkspaces.has(workspace.slug) && (
                <div className="ml-6 mt-1 space-y-1">
                  {workspace.scenarios.map((scenario) => {
                    const scenarioKey = getScenarioKey(workspace.slug, scenario.slug);
                    const isExpanded = expandedScenarios.has(scenarioKey);
                    
                    return (
                      <div key={scenario.slug}>
                        <div className="flex items-center group">
                          <button
                            onClick={() => toggleScenario(scenarioKey)}
                            className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left rounded-md hover:bg-zinc-100 min-w-0"
                          >
                            <span className="text-zinc-400 flex-shrink-0">
                              {isExpanded ? '📋' : '📄'}
                            </span>
                            <span className="text-zinc-700 truncate">
                              {scenario.name}
                            </span>
                            <span className="text-zinc-400 text-xs flex-shrink-0">
                              ({scenario.nodes.length})
                            </span>
                          </button>

                          <button
                            onClick={() => navigateToScenario(workspace.slug, scenario.slug)}
                            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                          >
                            Go
                          </button>
                        </div>

                        {/* Nodes/Steps */}
                        {isExpanded && scenario.nodes.length > 0 && (
                          <div className="ml-6 mt-1 space-y-0.5">
                            {scenario.nodes
                              .sort((a, b) => a.order - b.order)
                              .map((node) => (
                                <div
                                  key={node.slug}
                                  className="flex items-center gap-2 px-2 py-0.5 text-xs text-zinc-600"
                                >
                                  <span className="text-zinc-300">└─</span>
                                  <span className="text-zinc-400">⚙️</span>
                                  <span className="truncate">
                                    {node.label || node.slug}
                                  </span>
                                  <span className="text-zinc-300 text-xs">
                                    ({node.tplFile})
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {workspace.scenarios.length === 0 && (
                    <div className="px-2 py-1 text-xs text-zinc-400 italic">
                      No scenarios found in /scenarios/{workspace.slug}/
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">
                {!appConfig?.workspaces ? 
                  'No workspaces defined in app.json' : 
                  'No workspaces found'
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 bg-zinc-50">
        <div className="text-xs text-zinc-500 text-center">
          Click folders to expand • Click "Open/Go" to navigate
        </div>
        <div className="text-xs text-zinc-400 text-center mt-1">
          Found {workspaces.length} workspaces, {workspaces.reduce((total, ws) => total + ws.scenarios.length, 0)} scenarios
        </div>
        <div className="text-xs text-zinc-300 text-center mt-1">
          Discovery: Vite glob + runtime verification
        </div>
      </div>
    </div>
  );
};

export default AppTreeView;

