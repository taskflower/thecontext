// src/modules/appTree/components/TreeWorkspace.tsx
import React from 'react';
import { FolderOpen, Folder, Edit } from 'lucide-react';
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
  isViewingWorkspace: boolean;
  isViewingScenario: (scenarioSlug: string) => boolean;
  isViewingNode: (scenarioSlug: string, nodeSlug: string) => boolean;
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
  isViewingWorkspace,
  isViewingScenario,
  isViewingNode,
}) => {
  return (
    <div>
      <div className="flex items-center">
        <button
          onClick={() => onNavigateWorkspace(workspace.slug)}
          className="flex-1 flex items-center gap-2 px-2 py-1.5 text-sm text-left hover:bg-zinc-100 rounded-md"
        >
          {isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />}
          <span className="font-medium truncate">{workspace.name}</span>
          <span className="text-xs text-zinc-400">
            ({workspace.scenarios.length})
          </span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWorkspace(workspace.slug);
          }}
          className="px-1 py-1 text-zinc-400 hover:text-zinc-600 rounded"
        >
          {isExpanded ? '−' : '+'}
        </button>
        {isViewingWorkspace && (
          <button
            onClick={() => onEditWorkspace(workspace)}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded ml-1 flex items-center gap-1"
          >
            <Edit size={10} />
            Edytuj
          </button>
        )}
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
                onToggle={() => onToggleScenario(workspace.slug, scenario.slug)}
                onEditScenario={() => onEditScenario(workspace, scenario)}
                onNavigateNode={onNavigateNode}
                onEditNode={onEditNode}
                isViewingScenario={isViewingScenario(scenario.slug)}
                isViewingNode={(nodeSlug: string) =>
                  isViewingNode(scenario.slug, nodeSlug)
                }
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
