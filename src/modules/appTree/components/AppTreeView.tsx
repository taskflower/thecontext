// src/modules/appTree/components/AppTreeView.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "@/core";
import EditWorkspaceCard from "./EditWorkspaceCard";
import EditScenarioCard from "./EditScenarioCard";
import EditNodeCard from "./EditNodeCard";

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
  onClose?: () => void;
}

const AppTreeView: React.FC<AppTreeViewProps> = ({ configName, onClose }) => {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stany do edycji:
  const [editingWorkspace, setEditingWorkspace] = useState<WorkspaceInfo | null>(null);
  const [editingScenario, setEditingScenario] = useState<{
    workspace: WorkspaceInfo;
    scenario: ScenarioInfo;
  } | null>(null);
  const [editingNode, setEditingNode] = useState<{
    workspace: WorkspaceInfo;
    scenario: ScenarioInfo;
    node: NodeInfo;
  } | null>(null);

  const appConfig = useConfig<AppConfig>(
    configName,
    `/src/_configs/${configName}/app.json`
  );

  const allWorkspaceModules = import.meta.glob<{ name?: string }>(
    "/src/_configs/*/workspaces/*.json",
    { eager: true, as: "json" }
  );
  const allScenarioModules = import.meta.glob<{
    slug?: string;
    name?: string;
    nodes?: NodeInfo[];
  }>("/src/_configs/*/scenarios/*/*.json", { eager: true, as: "json" });

  useEffect(() => {
    if (!appConfig) return;

    try {
      setLoading(true);
      setError(null);

      // 1. Filtrujemy tylko workspace.json dla tego configName
      const workspaceEntries = Object.entries(allWorkspaceModules).filter(
        ([filePath]) =>
          filePath.startsWith(`/src/_configs/${configName}/workspaces/`)
      );

      // 2. Tworzymy słownik workspaces bez scenariuszy
      const loadedWorkspaces: Record<string, WorkspaceInfo> = {};
      workspaceEntries.forEach(([filePath, module]) => {
        const match = filePath.match(
          /\/src\/_configs\/[^/]+\/workspaces\/([^/]+)\.json$/
        );
        if (!match) return;
        const slug = match[1];
        loadedWorkspaces[slug] = {
          slug,
          name: module.name || slug,
          scenarios: [],
        };
      });

      // 3. Filtrujemy scenariusze tylko dla configName
      const scenarioEntries = Object.entries(allScenarioModules).filter(
        ([filePath]) =>
          filePath.startsWith(`/src/_configs/${configName}/scenarios/`)
      );

      // 4. Dodajemy scenariusze do workspace (albo „luźne”, jeśli brak workspace.json)
      scenarioEntries.forEach(([filePath, module]) => {
        const match = filePath.match(
          /\/src\/_configs\/[^/]+\/scenarios\/([^/]+)\/([^/]+)\.json$/
        );
        if (!match) return;
        const workspaceSlug = match[1];
        const scenarioSlug = match[2];

        if (!loadedWorkspaces[workspaceSlug]) {
          loadedWorkspaces[workspaceSlug] = {
            slug: workspaceSlug,
            name: workspaceSlug,
            scenarios: [],
          };
        }

        const scenarioName = module.name || (module as any).slug || scenarioSlug;
        loadedWorkspaces[workspaceSlug].scenarios.push({
          slug: scenarioSlug,
          name: scenarioName,
          nodes: module.nodes || [],
        });
      });

      // 5. Sortowanie scenariuszy wewnątrz workspace
      Object.values(loadedWorkspaces).forEach((ws) => {
        ws.scenarios.sort((a, b) => {
          const order = [
            "login",
            "profile",
            "list",
            "create",
            "edit",
            "view",
            "delete",
            "llm-create",
          ];
          const ai = order.indexOf(a.slug);
          const bi = order.indexOf(b.slug);
          if (ai !== -1 && bi !== -1) return ai - bi;
          if (ai !== -1) return -1;
          if (bi !== -1) return 1;
          return a.slug.localeCompare(b.slug);
        });
      });

      // 6. Zamieniamy słownik na tablicę i sortujemy według appConfig.workspaces
      let workspaceArray = Object.values(loadedWorkspaces);
      if (appConfig.workspaces) {
        workspaceArray = workspaceArray.sort(
          (a, b) =>
            appConfig.workspaces!.indexOf(a.slug) -
            appConfig.workspaces!.indexOf(b.slug)
        );
      } else {
        workspaceArray = workspaceArray.sort((a, b) =>
          a.slug.localeCompare(b.slug)
        );
      }

      setWorkspaces(workspaceArray);

      // 7. Inicjalne rozwinięcie (pierwszy workspace)
      if (workspaceArray.length > 0) {
        setExpandedWorkspace(workspaceArray[0].slug);
      }
    } catch (e) {
      console.error(e);
      setError("Błąd przy ładowaniu struktur workspace/scenario.");
    } finally {
      setLoading(false);
    }
  }, [appConfig]);

  const toggleWorkspace = (workspaceSlug: string) => {
    if (expandedWorkspace === workspaceSlug) {
      setExpandedWorkspace(null);
      setExpandedScenario(null);
    } else {
      setExpandedWorkspace(workspaceSlug);
      setExpandedScenario(null);
    }
  };

  const toggleScenario = (workspaceSlug: string, scenarioSlug: string) => {
    const key = `${workspaceSlug}:${scenarioSlug}`;
    if (expandedScenario === key) {
      setExpandedScenario(null);
    } else {
      setExpandedWorkspace(workspaceSlug);
      setExpandedScenario(key);
    }
  };

  const navigateToWorkspace = (workspaceSlug: string) => {
    setExpandedWorkspace(workspaceSlug);
    setExpandedScenario(null);
    navigate(`/${configName}/${workspaceSlug}`);
  };

  const navigateToNode = (
    workspaceSlug: string,
    scenarioSlug: string,
    nodeSlug: string
  ) => {
    setExpandedWorkspace(workspaceSlug);
    setExpandedScenario(`${workspaceSlug}:${scenarioSlug}`);
    navigate(`/${configName}/${workspaceSlug}/${scenarioSlug}/${nodeSlug}`);
  };

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
    <>
      <div className="relative bg-white rounded-lg shadow-lg overflow-auto max-h-full w-96">
        <div className="flex justify-between items-center px-4 py-2 border-b border-zinc-200">
          <span className="font-semibold text-sm">
            {appConfig?.name || configName}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md hover:bg-zinc-100"
            >
              ✖
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto">
          {workspaces.map((workspace) => {
            const isWsExpanded = expandedWorkspace === workspace.slug;
            return (
              <div key={workspace.slug}>
                {/* Wiersz workspace */}
                <div className="flex items-center group">
                  <button
                    onClick={() => toggleWorkspace(workspace.slug)}
                    className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-zinc-100 rounded-md"
                  >
                    <span>{isWsExpanded ? "📂" : "📁"}</span>
                    <span className="font-medium truncate">{workspace.name}</span>
                    <span className="text-xs text-zinc-400">
                      ({workspace.scenarios.length})
                    </span>
                  </button>
                  <button
                    onClick={() => navigateToWorkspace(workspace.slug)}
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => setEditingWorkspace(workspace)}
                    className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                  >
                    Edytuj
                  </button>
                </div>

                {/* Lista scenariuszy */}
                {isWsExpanded && workspace.scenarios.length > 0 && (
                  <div className="ml-6 mt-1 space-y-1">
                    {workspace.scenarios.map((scenario) => {
                      const scenarioKey = `${workspace.slug}:${scenario.slug}`;
                      const isScExpanded = expandedScenario === scenarioKey;
                      return (
                        <div key={scenario.slug}>
                          <div className="flex items-center">
                            <button
                              onClick={() =>
                                toggleScenario(workspace.slug, scenario.slug)
                              }
                              className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left hover:bg-zinc-100 rounded-md"
                            >
                              <span>{isScExpanded ? "📋" : "📄"}</span>
                              <span className="truncate">{scenario.name}</span>
                              <span className="text-xs text-zinc-400">
                                ({scenario.nodes.length})
                              </span>
                            </button>
                            <button
                              onClick={() =>
                                setEditingScenario({ workspace, scenario })
                              }
                              className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                            >
                              Edytuj
                            </button>
                          </div>

                          {isScExpanded && scenario.nodes.length > 0 && (
                            <div className="ml-6 mt-1 space-y-0.5">
                              {scenario.nodes
                                .sort((a, b) => a.order - b.order)
                                .map((node) => (
                                  <div
                                    key={node.slug}
                                    className="flex items-center gap-2 px-2 py-1 text-xs group hover:bg-zinc-50 rounded"
                                  >
                                    <span className="text-zinc-300">└─</span>
                                    <span className="text-zinc-400">⚙️</span>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-zinc-600 truncate">
                                        {node.label || node.slug}
                                      </div>
                                      <div className="text-zinc-400 text-xs truncate mt-0.5">
                                        {node.tplFile}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() =>
                                        navigateToNode(
                                          workspace.slug,
                                          scenario.slug,
                                          node.slug
                                        )
                                      }
                                      className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    >
                                      Go
                                    </button>
                                    <button
                                      onClick={() =>
                                        setEditingNode({ workspace, scenario, node })
                                      }
                                      className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
                                    >
                                      Edytuj
                                    </button>
                                  </div>
                                ))}
                            </div>
                          )}

                          {isScExpanded && scenario.nodes.length === 0 && (
                            <div className="ml-6 px-2 py-1 text-xs text-zinc-400 italic">
                              Brak kroków w tym scenariuszu
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isWsExpanded && workspace.scenarios.length === 0 && (
                  <div className="ml-6 px-2 py-1 text-xs text-zinc-400 italic">
                    Brak scenariuszy w /scenarios/{workspace.slug}/
                  </div>
                )}
              </div>
            );
          })}

          {workspaces.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">
                {!appConfig?.workspaces
                  ? "Brak zdefiniowanych workspaces w app.json"
                  : "Brak workspaces"}
              </div>
              {appConfig?.workspaces && (
                <div className="text-xs mt-2 text-zinc-500">
                  Oczekiwane workspaces: {appConfig.workspaces.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 text-center text-xs text-zinc-400">
          Znalazłem {workspaces.length} workspace’y,{" "}
          {workspaces.reduce((sum, ws) => sum + ws.scenarios.length, 0)}{" "}
          scenariuszy
        </div>
      </div>

      {/* Karty do edycji */}
      {editingWorkspace && (
        <EditWorkspaceCard
          workspace={editingWorkspace}
          onClose={() => setEditingWorkspace(null)}
        />
      )}
      {editingScenario && (
        <EditScenarioCard
          workspace={editingScenario.workspace}
          scenario={editingScenario.scenario}
          onClose={() => setEditingScenario(null)}
        />
      )}
      {editingNode && (
        <EditNodeCard
          workspace={editingNode.workspace}
          scenario={editingNode.scenario}
          node={editingNode.node}
          onClose={() => setEditingNode(null)}
        />
      )}
    </>
  );
};

export default AppTreeView;
