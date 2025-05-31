// src/modules/appTree/AppTreeView.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAppTreeData } from "../hooks/useAppTreeData";
import { TreeWorkspace } from "./TreeWorkspace";
import EditScenarioCard from "../../editScenario/EditScenarioCard";
import EditNodeCard from "../../editNode/EditNodeCard";
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from "../hooks/useAppTree";
import EditWorkspaceCard from "@/modules/editWorkspace/EditWorkspaceCard";

interface ExtendedAppConfig {
  name: string;
  tplDir: string;
  defaultWorkspace: string;
  defaultScenario: string;
  workspaces?: string[];
}

interface AppTreeViewProps {
  configName: string;
  onClose?: () => void;
}

const AppTreeView: React.FC<AppTreeViewProps> = ({ configName, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaces, loading, error, appConfig } = useAppTreeData(configName);
  const extendedAppConfig = appConfig as ExtendedAppConfig;

  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);
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

  const getCurrentView = () => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    if (pathParts.length < 2 || pathParts[0] !== configName) {
      return { workspace: null, scenario: null, node: null };
    }
    const workspace = pathParts[1] || null;
    const scenario = pathParts[2] || null;
    const node = pathParts[3] || null;
    return { workspace, scenario, node };
  };

  const currentView = getCurrentView();

  const isViewingWorkspace = (workspaceSlug: string) =>
    currentView.workspace === workspaceSlug && !currentView.scenario;

  const isViewingNode = (
    workspaceSlug: string,
    scenarioSlug: string,
    nodeSlug: string
  ) =>
    currentView.workspace === workspaceSlug &&
    currentView.scenario === scenarioSlug &&
    currentView.node === nodeSlug;

  // AUTO-EXPAND tylko kiedy nie zostało ręcznie ustawione
  useEffect(() => {
    if (currentView.workspace && workspaces.length > 0) {
      if (expandedWorkspace !== currentView.workspace) {
        setExpandedWorkspace(currentView.workspace);
      }
      if (currentView.scenario) {
        const key = `${currentView.workspace}:${currentView.scenario}`;
        if (expandedScenario !== key) {
          setExpandedScenario(key);
        }
      }
    } else if (!expandedWorkspace && workspaces.length > 0) {
      setExpandedWorkspace(workspaces[0].slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaces, currentView.workspace, currentView.scenario]);

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

  if (error) {
    return (
      <div className="p-4 text-red-600">
        <div className="text-sm">Błąd: {error}</div>
      </div>
    );
  }

  return (
    <>
      <div className="relative bg-white rounded-lg shadow-lg overflow-auto max-h-full w-96">
        <div className="p-4 overflow-y-auto">
          {workspaces.map((workspace) => {
            const isWsExpanded = expandedWorkspace === workspace.slug;
            return (
              <TreeWorkspace
                key={workspace.slug}
                workspace={workspace}
                isExpanded={isWsExpanded}
                expandedScenario={expandedScenario}
                onToggleWorkspace={toggleWorkspace}
                onToggleScenario={toggleScenario}
                onNavigateWorkspace={navigateToWorkspace}
                onEditWorkspace={setEditingWorkspace}
                onEditScenario={(ws, sc) =>
                  setEditingScenario({ workspace: ws, scenario: sc })
                }
                onNavigateNode={navigateToNode}
                onEditNode={(workspace, scenario, node) =>
                  setEditingNode({ workspace, scenario, node })
                }
                isViewingWorkspace={isViewingWorkspace(workspace.slug)}
                isViewingScenario={(scenarioSlug: string) =>
                  currentView.scenario === scenarioSlug &&
                  currentView.workspace === workspace.slug
                }
                isViewingNode={(scenarioSlug: string, nodeSlug: string) =>
                  isViewingNode(workspace.slug, scenarioSlug, nodeSlug)
                }
              />
            );
          })}

          {workspaces.length === 0 && (
            <div className="text-center py-8 text-zinc-400">
              <div className="text-2xl mb-2">📭</div>
              <div className="text-sm">
                {!extendedAppConfig?.workspaces
                  ? "Brak zdefiniowanych workspaces w app.json"
                  : "Brak workspaces"}
              </div>
              {extendedAppConfig?.workspaces && (
                <div className="text-xs mt-2 text-zinc-500">
                  Oczekiwane workspaces:{" "}
                  {extendedAppConfig.workspaces.join(", ")}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-zinc-200 bg-zinc-50 text-center text-xs text-zinc-400">
          Znalazłem {workspaces.length} workspace'y,{" "}
          {workspaces.reduce((sum, ws) => sum + ws.scenarios.length, 0)}{" "}
          scenariuszy
        </div>
      </div>

      {editingWorkspace && (
        <EditWorkspaceCard
          workspace={editingWorkspace}
          configName={configName}
          onClose={() => setEditingWorkspace(null)}
        />
      )}
      {editingScenario && (
        <EditScenarioCard
          workspace={editingScenario.workspace}
          scenario={editingScenario.scenario}
          configName={configName}
          onClose={() => setEditingScenario(null)}
          onSave={() => setEditingScenario(null)}
        />
      )}
      {editingNode && (
        <EditNodeCard
          workspace={editingNode.workspace}
          scenario={editingNode.scenario}
          node={editingNode.node}
          configName={configName}
          onClose={() => setEditingNode(null)}
        />
      )}
    </>
  );
};

export default AppTreeView;
