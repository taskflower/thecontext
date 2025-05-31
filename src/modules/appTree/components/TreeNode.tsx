// src/modules/appTree/components/TreeNode.tsx
import React from 'react';
import { Settings, Edit } from 'lucide-react';
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from '../hooks/useAppTree';

interface TreeNodeProps {
  node: NodeInfo;
  workspace: WorkspaceInfo;
  scenario: ScenarioInfo;
  onNavigate: (workspaceSlug: string, scenarioSlug: string, nodeSlug: string) => void;
  onEdit: (workspace: WorkspaceInfo, scenario: ScenarioInfo, node: NodeInfo) => void;
  isViewingNode: boolean;
}

export const TreeNode: React.FC<TreeNodeProps> = ({
  node,
  workspace,
  scenario,
  onNavigate,
  onEdit,
  isViewingNode,
}) => {
  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs rounded -mr-2">
      <span className="text-zinc-300">└─</span>
      <Settings size={12} className="text-zinc-400" />
      <button
        onClick={() => onNavigate(workspace.slug, scenario.slug, node.slug)}
        className="flex-1 min-w-0 text-left hover:bg-zinc-100 px-2 py-1 rounded"
      >
        <div className="text-zinc-600 truncate">
          {node.label || node.slug}
        </div>
        <div className="text-zinc-400 text-xs truncate mt-0.5">
          {node.tplFile}
        </div>
      </button>
      {isViewingNode && (
        <button
          onClick={() => onEdit(workspace, scenario, node)}
          className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded ml-1 flex items-center gap-1"
        >
          <Edit size={8} />
          Edytuj
        </button>
      )}
    </div>
  );
};
