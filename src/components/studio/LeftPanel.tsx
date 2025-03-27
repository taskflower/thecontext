import { FolderOpen, GitBranch, Layers, Code } from "lucide-react";
import { TabButton } from "./TabButton";
import { WorkspacesList } from "@/modules/workspaces";
import { ScenariosList } from "@/modules/scenarios";
import { EdgesList, NodesList } from "@/modules/graph/components";
import React from "react";
import { usePanelStore } from "@/modules/PanelStore";


export const LeftPanel: React.FC = () => {
  const { leftPanelTab, setLeftPanelTab } = usePanelStore();

  return (
    <aside className="min-w-[400px] border-r border-border flex flex-col overflow-hidden bg-muted/20">
      <nav className="p-1 flex border-b border-border">
        <TabButton
          icon={<FolderOpen className="h-4 w-4" />}
          label="Workspace"
          active={leftPanelTab === "workspace"}
          onClick={() => setLeftPanelTab("workspace")}
        />
        <TabButton
          icon={<GitBranch className="h-4 w-4" />}
          label="Scenarios"
          active={leftPanelTab === "scenarios"}
          onClick={() => setLeftPanelTab("scenarios")}
        />
        <TabButton
          icon={<Layers className="h-4 w-4" />}
          label="Nodes"
          active={leftPanelTab === "nodes"}
          onClick={() => setLeftPanelTab("nodes")}
        />
        <TabButton
          icon={<Code className="h-4 w-4" />}
          label="Edges"
          active={leftPanelTab === "edges"}
          onClick={() => setLeftPanelTab("edges")}
        />
      </nav>

      <div className="flex-1 overflow-auto">
        {leftPanelTab === "workspace" && <WorkspacesList />}
        {leftPanelTab === "scenarios" && <ScenariosList />}
        {leftPanelTab === "nodes" && <NodesList />}
        {leftPanelTab === "edges" && <EdgesList />}
      </div>
    </aside>
  );
};