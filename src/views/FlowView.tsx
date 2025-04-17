// src/views/FlowView.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppStore } from "../lib/store";
import {
  getLayoutComponent,
  getFlowStepComponent,
  getFlowStepForNodeType,
} from "../lib/templates";
import { useNodeManager } from "../hooks/useNodeManager";
import DebugPanel from "@/components/debug";


const FlowView: React.FC = () => {
  // Extract route parameters
  const { workspace, scenario } = useParams<{
    workspace: string;
    scenario: string;
  }>();

  // Get store actions and state
  const {
    getCurrentWorkspace,
    getCurrentScenario,
    selectWorkspace,
    selectScenario,
  } = useAppStore();

  // Set up the workspace and scenario based on URL parameters
  useEffect(() => {
    if (workspace) {
      selectWorkspace(workspace);
    }

    if (scenario) {
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  // Get workspace from store
  const currentWorkspace = getCurrentWorkspace();
  // Note: currentScenario will be used from useNodeManager below

  // Use the node manager to handle flow logic
  const {
    currentNode,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    handleGoToScenariosList,
    contextItems,
    currentScenario,
  } = useNodeManager();

  // If data is not yet loaded, show loading state
  if (!currentWorkspace || !currentScenario) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Loading data... (Missing workspace or scenario)</p>
      </div>
    );
  }

  // If current node is not available, show error state
  if (!currentNode) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Error: No node found for the current flow.</p>
      </div>
    );
  }

  // Get layout component based on workspace settings
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings.layoutTemplate
  );

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
    return <div>Error: Layout component not found.</div>;
  }

  if (!FlowStepComponent) {
    return <div>Error: Flow step component not found.</div>;
  }

  return (
    <>
      <LayoutComponent
        title={currentNode.label}
        showBackButton={false} // No back button in educational template
      >
        {/* Add navigation buttons at top for education template */}
        {currentWorkspace?.templateSettings?.layoutTemplate?.includes('edu') && (
          <div className="mb-4">
            {isLastNode ? (
              <button
                onClick={handleGoToScenariosList}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Powrót do listy lekcji
              </button>
            ) : null}
          </div>
        )}
        
        <FlowStepComponent
         key={currentNode.id} 
          node={currentNode}
          onSubmit={handleNodeExecution}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode}
          contextItems={contextItems}
          scenario={currentScenario} // Pass the scenario for context
        />
      </LayoutComponent>
      <DebugPanel />
    </>
  );
};

export default FlowView;
