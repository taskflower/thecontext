// src/views/FlowView.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getLayoutComponent,
  getFlowStepComponent,
  getFlowStepForNodeType,
} from "../tpl";
import { useNodeManager } from "../hooks/useNodeManager";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

const FlowView: React.FC = () => {
  const { workspace, scenario } = useParams<{
    workspace: string;
    scenario: string;
  }>();

  const { getCurrentWorkspace, selectWorkspace, selectScenario } =
    useWorkspaceStore();

  useEffect(() => {
    if (workspace) {
      selectWorkspace(workspace);
    }
    if (scenario) {
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);
  const currentWorkspace = getCurrentWorkspace();

  const {
    currentNode,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    contextItems,
    currentScenario,
  } = useNodeManager();

  if (!currentWorkspace || !currentScenario) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Loading data... (Missing workspace or scenario)</p>
      </div>
    );
  }

  if (!currentNode) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Error: No node found for the current flow.</p>
      </div>
    );
  }

  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings?.layoutTemplate || "default"
  );

  let FlowStepComponent;
  if (currentNode.templateId) {
    FlowStepComponent = getFlowStepComponent(currentNode.templateId);
  } else if (currentNode.type) {
    FlowStepComponent = getFlowStepForNodeType(currentNode.type);
  }

  if (!LayoutComponent) {
    return <div>Error: Layout component not found.</div>;
  }

  if (!FlowStepComponent) {
    return <div>Error: Flow step component not found.</div>;
  }

  return (
    <LayoutComponent>
      <FlowStepComponent
        key={currentNode.id}
        node={currentNode}
        onSubmit={handleNodeExecution}
        onPrevious={handlePreviousNode}
        isLastNode={isLastNode}
        contextItems={contextItems}
        scenario={currentScenario}
      />
    </LayoutComponent>
  );
};

export default FlowView;
