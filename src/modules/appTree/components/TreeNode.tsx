// src/modules/appTree/components/TreeNode.tsx
import React from 'react';
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from '../hooks/useAppTree';

interface TreeNodeProps {
  node: NodeInfo;
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  onNavigate: (workspaceSlug: string, scenarioSlug: string, nodeSlug: string) => void;
  onEdit: (workspace: WorkspaceInfo, scenario: ScenarioInfo, node: NodeInfo) => void;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  workspace,
  scenario,
  onNavigate,
  onEdit,
}) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs group hover:bg-zinc-50 rounded">
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
        onClick={() => onNavigate(workspace.slug, scenario.slug, node.slug)}
        className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
      >
        Go
      </button>
      <button
        onClick={() => onEdit(workspace, scenario, node)}
        className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded opacity-0 group-hover:opacity-100 transition-opacity ml-1"
      >
        Edytuj
      </button>
    </div>
  );
};