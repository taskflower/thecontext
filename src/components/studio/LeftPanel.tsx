// src/components/studio/LeftPanel.tsx
import { useState } from "react";
import { FolderOpen, GitBranch, Layers, Code } from "lucide-react";
import { TabButton } from "./TabButton";
import { WorkspacesList } from "@/modules/workspaces";
import { ScenariosList } from "@/modules/scenarios";
import { EdgesList, NodesList } from "@/modules/graph/components";
import React from "react";

// Dodanie props wymaganych dla obsługi dialogów
interface LeftPanelProps {
  onEditNode: () => void;
  onConfigurePlugin: () => void;
  onEditPluginOptions: () => void;
  onEditEdge: (edgeId: string) => void;
  onAddNode: () => void;
  onAddEdge: () => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  onEditNode,
  onConfigurePlugin,
  onEditPluginOptions,
  onEditEdge,
  onAddNode,
  onAddEdge
}) => {
  const [activeTab, setActiveTab] = useState("workspace");

  return (
    <aside className="min-w-[400px] border-r border-border flex flex-col overflow-hidden bg-muted/20">
      <nav className="p-1 flex border-b border-border">
        <TabButton
          icon={<FolderOpen className="h-4 w-4" />}
          label="Workspace"
          active={activeTab === "workspace"}
          onClick={() => setActiveTab("workspace")}
        />
        <TabButton
          icon={<GitBranch className="h-4 w-4" />}
          label="Scenarios"
          active={activeTab === "scenarios"}
          onClick={() => setActiveTab("scenarios")}
        />
        <TabButton
          icon={<Layers className="h-4 w-4" />}
          label="Nodes"
          active={activeTab === "nodes"}
          onClick={() => setActiveTab("nodes")}
        />
        <TabButton
          icon={<Code className="h-4 w-4" />}
          label="Edges"
          active={activeTab === "edges"}
          onClick={() => setActiveTab("edges")}
        />
      </nav>

      <div className="flex-1 overflow-auto">
        {activeTab === "workspace" && <WorkspacesList />}
        {activeTab === "scenarios" && <ScenariosList />}
        {activeTab === "nodes" && (
          <NodesList 
            onEditNode={onEditNode}
            onConfigurePlugin={onConfigurePlugin}
            onEditPluginOptions={onEditPluginOptions}
            onAddNode={onAddNode}
          />
        )}
        {activeTab === "edges" && (
          <EdgesList 
            onEditEdge={onEditEdge}
            onAddEdge={onAddEdge}
          />
        )}
      </div>
    </aside>
  );
};

export default LeftPanel;