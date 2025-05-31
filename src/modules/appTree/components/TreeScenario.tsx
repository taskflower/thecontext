// src/modules/appTree/components/TreeScenario.tsx (Poprawiony)
import React from 'react';
import { FileText, File } from 'lucide-react';
import { TreeNode } from './TreeNode';
import { NodeInfo, ScenarioInfo, WorkspaceInfo } from '../hooks/useAppTree';

interface TreeScenarioProps {
  scenario: ScenarioInfo;
  workspace: WorkspaceInfo;
  isExpanded: boolean;
  onToggle: (workspaceSlug: string, scenarioSlug: string) => void;
  onNavigateNode: (workspaceSlug: string, scenarioSlug: string, nodeSlug: string) => void;
  onEditNode: (workspace: WorkspaceInfo, scenario: ScenarioInfo, node: NodeInfo) => void;
  isViewingNode: (nodeSlug: string) => boolean;
}

export const TreeScenario: React.FC<TreeScenarioProps> = ({
  scenario,
  workspace,
  isExpanded,
  onToggle,
  onNavigateNode,
  onEditNode,
  isViewingNode,
}) => {
  return (
    <div>
      <div className="flex items-center group">
        <button
          onClick={() => onToggle(workspace.slug, scenario.slug)}
          className="flex-1 flex items-center gap-2 px-2 py-1 text-sm text-left hover:bg-zinc-100 rounded-md"
        >
          {isExpanded ? <FileText size={14} /> : <File size={14} />}
          <span className="truncate">{scenario.name}</span>
          <span className="text-xs text-zinc-400">
            ({scenario.nodes.length})
          </span>
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
                isViewingNode={isViewingNode(node.slug)}
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