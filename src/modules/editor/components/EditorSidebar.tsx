// src/modules/editor/components/EditorSidebar.tsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useConfig } from "@/core/engine";

interface AppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
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

interface EditorSidebarProps {
  configName: string;
}

export default function EditorSidebar({ configName }: EditorSidebarProps) {
  const navigate = useNavigate();
  const {
    workspace: currentWorkspace,
    scenario: currentScenario,
    type: currentType,
  } = useParams();
  const [workspaces, setWorkspaces] = useState<WorkspaceInfo[]>([]);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

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

      // Spróbuj najpierw pobrać listę z folderu (jeśli backend to obsługuje)
      // Lub użyj znanej listy workspace'ów
      const potentialWorkspaces = [
        "main",
        "tickets",
        "users",
        "profiles",
        "dashboard",
        "settings",
        "reports",
        "analytics",
        "admin",
      ];

      for (const workspaceSlug of potentialWorkspaces) {
        try {
          const response = await fetch(
            `/src/_configs/${configName}/workspaces/${workspaceSlug}.json`
          );
          if (!response.ok) continue;

          const workspaceConfig = await response.json();
          const scenarios = await loadScenariosForWorkspace(workspaceSlug);

          workspaceList.push({
            slug: workspaceSlug,
            name: workspaceConfig.name || workspaceSlug,
            scenarios,
          });
        } catch (error) {
          continue;
        }
      }

      setWorkspaces(workspaceList);

      // Automatycznie rozwiń current workspace
      if (currentWorkspace) {
        setExpandedWorkspaces(new Set([currentWorkspace]));
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadScenariosForWorkspace = async (
    workspaceSlug: string
  ): Promise<ScenarioInfo[]> => {
    const scenarios: ScenarioInfo[] = [];

    // Rozszerzona lista potencjalnych scenariuszy
    const potentialScenarios = [
      "list",
      "create",
      "edit",
      "view",
      "delete",
      "llm-create",
      "search",
      "filter",
      "export",
      "import",
      "bulk-edit",
      "archive",
      "restore",
    ];

    for (const scenarioSlug of potentialScenarios) {
      try {
        const response = await fetch(
          `/src/_configs/${configName}/scenarios/${workspaceSlug}/${scenarioSlug}.json`
        );
        if (!response.ok) continue;

        const scenarioConfig = await response.json();

        scenarios.push({
          slug: scenarioSlug,
          name: scenarioConfig.name || scenarioConfig.slug || scenarioSlug,
          nodes: scenarioConfig.nodes || [],
        });
      } catch (error) {
        continue;
      }
    }

    return scenarios.sort((a, b) => {
      // Sortuj scenariusze w logicznej kolejności
      const order = ["list", "create", "edit", "view", "delete"];
      const aIndex = order.indexOf(a.slug);
      const bIndex = order.indexOf(b.slug);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return a.slug.localeCompare(b.slug);
    });
  };

  const copyPath = async (path: string) => {
    try {
      await navigator.clipboard.writeText(path);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000); // Reset after 2 seconds
    } catch (error) {
      console.error("Failed to copy path:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = path;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopiedPath(path);
      setTimeout(() => setCopiedPath(null), 2000);
    }
  };

  const getWorkspacePath = (workspaceSlug: string) => `/${workspaceSlug}`;
  const getScenarioPath = (workspaceSlug: string, scenarioSlug: string) =>
    `/${workspaceSlug}/${scenarioSlug}`;

  const toggleWorkspace = (workspaceSlug: string) => {
    const newExpanded = new Set(expandedWorkspaces);
    if (newExpanded.has(workspaceSlug)) {
      newExpanded.delete(workspaceSlug);
    } else {
      newExpanded.add(workspaceSlug);
    }
    setExpandedWorkspaces(newExpanded);
  };

  const navigateToWorkspace = (workspaceSlug: string) => {
    navigate(`/edit/${configName}/${workspaceSlug}/workspace`);
  };

  const navigateToScenario = (workspaceSlug: string, scenarioSlug: string) => {
    navigate(`/edit/${configName}/${workspaceSlug}/${scenarioSlug}/scenario`);
  };

  const isCurrentWorkspace = (workspaceSlug: string) => {
    return currentWorkspace === workspaceSlug && currentType === "workspace";
  };

  const isCurrentScenario = (workspaceSlug: string, scenarioSlug: string) => {
    return (
      currentWorkspace === workspaceSlug &&
      currentScenario === scenarioSlug &&
      currentType === "scenario"
    );
  };

  if (loading) {
    return (
      <div className="w-80 bg-zinc-50 border-r border-zinc-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-zinc-200 rounded w-3/4"></div>
          <div className="h-4 bg-zinc-200 rounded w-1/2"></div>
          <div className="h-4 bg-zinc-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-zinc-50 border-r border-zinc-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-zinc-200">
        <h2 className="text-lg font-semibold text-zinc-900">
          📁 Configuration Explorer
        </h2>
        <p className="text-sm text-zinc-600 mt-1">Config: {configName}</p>
      </div>

      {/* Tree View */}
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
                    {expandedWorkspaces.has(workspace.slug) ? "📂" : "📁"}
                  </span>
                  <span className="font-medium text-zinc-900 truncate">
                    {workspace.name}
                  </span>
                  <span className="text-zinc-400 text-xs flex-shrink-0">
                    ({workspace.scenarios.length})
                  </span>
                </button>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => copyPath(getWorkspacePath(workspace.slug))}
                    className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded"
                    title={`Copy path: ${getWorkspacePath(workspace.slug)}`}
                  >
                    {copiedPath === getWorkspacePath(workspace.slug) ? (
                      <svg
                        className="w-3 h-3 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={() => navigateToWorkspace(workspace.slug)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      isCurrentWorkspace(workspace.slug)
                        ? "bg-blue-100 text-blue-700"
                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                    }`}
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Scenarios */}
              {expandedWorkspaces.has(workspace.slug) && (
                <div className="ml-6 mt-1 space-y-1">
                  {workspace.scenarios.map((scenario) => (
                    <div key={scenario.slug} className="group">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            navigateToScenario(workspace.slug, scenario.slug)
                          }
                          className={`flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left rounded-md transition-colors min-w-0 ${
                            isCurrentScenario(workspace.slug, scenario.slug)
                              ? "bg-blue-100 text-blue-900"
                              : "text-zinc-700 hover:bg-zinc-100"
                          }`}
                        >
                          <span className="text-zinc-400 flex-shrink-0">
                            📋
                          </span>
                          <span className="truncate">{scenario.slug}</span>
                          <span className="text-zinc-400 text-xs flex-shrink-0">
                            ({scenario.nodes.length})
                          </span>
                        </button>

                        <button
                          onClick={() =>
                            copyPath(
                              getScenarioPath(workspace.slug, scenario.slug)
                            )
                          }
                          className="p-1 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          title={`Copy path: ${getScenarioPath(
                            workspace.slug,
                            scenario.slug
                          )}`}
                        >
                          {copiedPath ===
                          getScenarioPath(workspace.slug, scenario.slug) ? (
                            <svg
                              className="w-3 h-3 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </button>
                      </div>

                      {/* Nodes/Steps */}
                      {scenario.nodes.length > 0 && (
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
                  ))}

                  {workspace.scenarios.length === 0 && (
                    <div className="px-2 py-1 text-xs text-zinc-400 italic">
                      No scenarios
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {workspaces.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">No workspaces found</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-zinc-200 space-y-2">
        <button
          onClick={() => navigate(`/edit/${configName}/new/workspace`)}
          className="w-full px-3 py-2 text-sm bg-zinc-900 text-white rounded-md hover:bg-zinc-800 transition-colors"
        >
          ➕ New Workspace
        </button>
        <button
          onClick={() =>
            navigate(`/${configName}/${appConfig?.defaultWorkspace || "main"}`)
          }
          className="w-full px-3 py-2 text-sm bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors"
        >
          👁️ Preview App
        </button>
      </div>
    </div>
  );
}
