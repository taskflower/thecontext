// src/modules/appTree/components/TreeScenario.tsx
import React from 'react';
import { TreeNode } from './TreeNode';
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from '../hooks/useAppTree';

interface TreeScenarioProps {
  scenario: ScenarioInfo;
  workspace: WorkspaceInfo;
  isExpanded: boolean;
  onToggle: (workspaceSlug: string, scenarioSlug: string) => void;
  onEditScenario: (workspace: WorkspaceInfo, scenario: ScenarioInfo) => void;
  onNavigateNode: (workspaceSlug: string, scenarioSlug: string, nodeSlug: string) => void;
  onEditNode: (workspace: WorkspaceInfo, scenario: ScenarioInfo, node: NodeInfo) => void;
}

export const TreeScenario: React.FC<TreeScenarioProps> = ({
  scenario,
  workspace,
  isExpanded,
  onToggle,
  onEditScenario,
  onNavigateNode,
  onEditNode,
}) => {
  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => onToggle(workspace.slug, scenario.slug)}
          className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left hover:bg-zinc-100 rounded-md"
        >
          <span>{isExpanded ? "📋" : "📄"}</span>
          <span className="truncate">{scenario.name}</span>
          <span className="text-xs text-zinc-400">
            ({scenario.nodes.length})
          </span>
        </button>
        <button
          onClick={() => onEditScenario(workspace, scenario)}
          className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
        >
          Edytuj
        </button>
      </div>

      {isExpanded && scenario.nodes.length > 0 && (
        <div className="ml-6 mt-1 space-y-0.5">
          {scenario.nodes
            .sort((a, b) => a.order - b.order)
            .map((node) => (
              <TreeNode
                key={node.slug}
                node={node}
                workspace={workspace}
                scenario={scenario}
                onNavigate={onNavigateNode}
                onEdit={onEditNode}
              />
            ))}
        </div>
      )}

      {isExpanded && scenario.nodes.length === 0 && (
        <div className="ml-6 px-2 py-1 text-xs text-zinc-400 italic">
          Brak kroków w tym scenariuszu
        </div>
      )}
    </div>
  );
};
