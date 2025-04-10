// src/views/FlowView.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { getLayoutComponent, getFlowStepComponent, getFlowStepForNodeType } from "../lib/templates";
import { useNodeManager } from "../hooks/useNodeManager";
import DebugPanel from "@/components/DebugPanel";

const FlowView: React.FC = () => {
  // Extract route parameters
  const { workspace, scenario } = useParams<{ workspace: string; scenario: string }>();
  
  // Get store actions and state
  const { getCurrentWorkspace, getCurrentScenario, selectWorkspace, selectScenario } = useAppStore();
  
  // Set up the workspace and scenario based on URL parameters
  useEffect(() => {
    console.log("[FlowView] Initializing with params:", { workspace, scenario });
    
    if (workspace) {
      console.log("[FlowView] Selecting workspace:", workspace);
      selectWorkspace(workspace); // selectWorkspace now also initializes context
    }
    
    if (scenario) {
      console.log("[FlowView] Selecting scenario:", scenario);
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);
  
  // Get current data from store
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  
  // Use the node manager to handle flow logic
  const {
    currentNode,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    contextItems
  } = useNodeManager();

  // Debugging information
  console.log("[FlowView] Current state:", { 
    currentWorkspace: currentWorkspace?.id, 
    currentScenario: currentScenario?.id,
    currentNode: currentNode?.id,
    nodes: currentScenario?.nodes?.length || 0
  });

  // If data is not yet loaded, show loading state
  if (!currentWorkspace || !currentScenario) {
    console.log("[FlowView] Missing workspace or scenario");
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Loading data... (Missing workspace or scenario)</p>
      </div>
    );
  }

  // If current node is not available, show error state
  if (!currentNode) {
    console.log("[FlowView] Missing current node, nodes available:", currentScenario.nodes?.length || 0);
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Error: No node found for the current flow.</p>
      </div>
    );
  }

  // Get layout component based on workspace settings
  const LayoutComponent = getLayoutComponent(currentWorkspace.templateSettings.layoutTemplate);
  
  // Get flow step component based on node settings or type
  let FlowStepComponent;
  if (currentNode.templateId) {
    FlowStepComponent = getFlowStepComponent(currentNode.templateId);
  } else if (currentNode.type) {
    const flowStep = getFlowStepForNodeType(currentNode.type);
    FlowStepComponent = flowStep?.component;
  }

  // If components are missing, show error
  if (!LayoutComponent) {
    console.error("[FlowView] Layout component not found:", currentWorkspace.templateSettings.layoutTemplate);
    return <div>Error: Layout component not found.</div>;
  }
  
  if (!FlowStepComponent) {
    console.error("[FlowView] Flow step component not found for:", { 
      templateId: currentNode.templateId, 
      type: currentNode.type 
    });
    return <div>Error: Flow step component not found.</div>;
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
          scenario={currentScenario} // Pass the scenario for context
        />
      </LayoutComponent>
      <DebugPanel/>
    </>
  );
};

export default FlowView;