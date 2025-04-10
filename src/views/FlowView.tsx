// src/views/FlowView.tsx
import React from "react";
import { useAppStore } from "../lib/store";
import { getLayoutComponent, getFlowStepComponent, getFlowStepForNodeType } from "../lib/templates";
import { useNodeManager } from "../hooks/useNodeManager";

const FlowView: React.FC = () => {
  const { getCurrentWorkspace, getCurrentScenario } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();

  const {
    currentNode,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    contextItems
  } = useNodeManager();

  if (!currentWorkspace || !currentScenario || !currentNode) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Loading data...</p>
      </div>
    );
  }

  const LayoutComponent = getLayoutComponent(currentWorkspace.templateSettings.layoutTemplate);
  let FlowStepComponent;
  if (currentNode.templateId) {
    FlowStepComponent = getFlowStepComponent(currentNode.templateId);
  } else {
    FlowStepComponent = getFlowStepForNodeType(currentNode.type)?.component;
  }

  if (!LayoutComponent || !FlowStepComponent) {
    return <div>Error: Missing component.</div>;
  }

  return (
    <>
      <LayoutComponent title={currentNode.label} showBackButton onBackClick={handlePreviousNode}>
        <FlowStepComponent
          node={currentNode}
          onSubmit={handleNodeExecution}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode}
          contextItems={contextItems}
        />
      </LayoutComponent>
      {/* <DebugPanel nodeData={debugInfo} /> */}
    </>
  );
};

export default FlowView;
