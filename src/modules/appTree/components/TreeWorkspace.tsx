// src/modules/appTree/components/TreeWorkspace.tsx
import React from 'react';
import { TreeScenario } from './TreeScenario';
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from '../hooks/useAppTree';

interface TreeWorkspaceProps {
  workspace: WorkspaceInfo;
  isExpanded: boolean;
  expandedScenario: string | null;
  onToggleWorkspace: (workspaceSlug: string) => void;
  onToggleScenario: (workspaceSlug: string, scenarioSlug: string) => void;
  onNavigateWorkspace: (workspaceSlug: string) => void;
  onEditWorkspace: (workspace: WorkspaceInfo) => void;
  onEditScenario: (workspace: WorkspaceInfo, scenario: ScenarioInfo) => void;
  onNavigateNode: (workspaceSlug: string, scenarioSlug: string, nodeSlug: string) => void;
  onEditNode: (workspace: WorkspaceInfo, scenario: ScenarioInfo, node: NodeInfo) => void;
}

export const TreeWorkspace: React.FC<TreeWorkspaceProps> = ({
  workspace,
  isExpanded,
  expandedScenario,
  onToggleWorkspace,
  onToggleScenario,
  onNavigateWorkspace,
  onEditWorkspace,
  onEditScenario,
  onNavigateNode,
  onEditNode,
}) => {
  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => onToggleWorkspace(workspace.slug)}
          className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-zinc-100 rounded-md"
        >
          <span>{isExpanded ? "📂" : "📁"}</span>
          <span className="font-medium truncate">{workspace.name}</span>
          <span className="text-xs text-zinc-400">
            ({workspace.scenarios.length})
          </span>
        </button>
        <button
          onClick={() => onNavigateWorkspace(workspace.slug)}
          className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        >
          Open
        </button>
        <button
          onClick={() => onEditWorkspace(workspace)}
          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        >
          Edytuj
        </button>
      </div>

      {isExpanded && workspace.scenarios.length > 0 && (
        <div className="ml-6 mt-1 space-y-1">
          {workspace.scenarios.map((scenario) => {
            const scenarioKey = `${workspace.slug}:${scenario.slug}`;
            const isScenarioExpanded = expandedScenario === scenarioKey;
            
            return (
              <TreeScenario
                key={scenario.slug}
                scenario={scenario}
                workspace={workspace}
                isExpanded={isScenarioExpanded}
                onToggle={onToggleScenario}
                onEditScenario={onEditScenario}
                onNavigateNode={onNavigateNode}
                onEditNode={onEditNode}
              />
            );
          })}
        </div>
      )}

      {isExpanded && workspace.scenarios.length === 0 && (
        <div className="ml-6 px-2 py-1 text-xs text-zinc-400 italic">
          Brak scenariuszy w /scenarios/{workspace.slug}/
        </div>
      )}
    </div>
  );
};