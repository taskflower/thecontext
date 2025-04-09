// src/views/FlowView.tsx
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { useNodeManager } from '../hooks/useNodeManager';
import { templateRegistry } from '../templates';

export const FlowView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const { workspaces } = useAppStore();

  const {
    currentNode,
    currentScenario,
    isLastNode,
    contextItems,
    handleGoToScenariosList,
    handlePreviousNode,
    handleNodeExecution,
    debugInfo,
  } = useNodeManager();

  // Find current workspace
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);

  if (!currentWorkspace) {
    return <div className="p-4">Workspace not found</div>;
  }

  // Get layout template for this workspace
  const layoutTemplateId = currentWorkspace.templateSettings.layoutTemplate;
  const LayoutComponent = templateRegistry.getLayout(layoutTemplateId)?.component;

  if (!LayoutComponent) {
    return <div className="p-4">Layout template not found: {layoutTemplateId}</div>;
  }

  if (!debugInfo.workspaceId) return <div className="p-4">No workspace selected</div>;
  if (!debugInfo.scenarioId) return <div className="p-4">No scenario selected</div>;
  if (!currentNode) return <div className="p-4">No current node available</div>;

  // Get appropriate flow step template for this node
  // First try to use the node's specific template, if defined
  const nodeTemplateId = currentNode.templateId || currentWorkspace.templateSettings.defaultFlowStepTemplate;
  const FlowStepComponent = templateRegistry.getFlowStep(nodeTemplateId)?.component;

  if (!FlowStepComponent) {
    // If not found, try to find a compatible template for the node type
    const nodeType = currentNode.type || 'default';
    const compatibleComponent = templateRegistry.getFlowStepForNodeType(nodeType)?.component;
    
    if (!compatibleComponent) {
      return <div className="p-4">Flow step template not found: {nodeTemplateId}</div>;
    }
    
    return (
      <Suspense fallback={<div className="p-4">Loading template...</div>}>
        <LayoutComponent 
          title={`Flow: ${currentNode.label}`}
          showBackButton={true}
          onBackClick={handleGoToScenariosList}
        >
          <div className="space-y-4">
            {React.createElement(compatibleComponent, {
              node: currentNode,
              scenario: currentScenario,  // Przekazujemy też informacje o scenariuszu
              onSubmit: handleNodeExecution,
              onPrevious: handlePreviousNode,
              isLastNode,
              contextItems,
            })}
            
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <details>
                <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
                <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        </LayoutComponent>
      </Suspense>
    );
  }

  return (
    <Suspense fallback={<div className="p-4">Loading template...</div>}>
      <LayoutComponent 
        title={`Flow: ${currentNode.label}`}
        showBackButton={true}
        onBackClick={handleGoToScenariosList}
      >
        <div className="space-y-4">
          <FlowStepComponent
            node={currentNode}
            scenario={currentScenario}  // Przekazujemy też informacje o scenariuszu
            onSubmit={handleNodeExecution}
            onPrevious={handlePreviousNode}
            isLastNode={isLastNode}
            contextItems={contextItems}
          />

          <div className="mt-8 p-4 bg-gray-100 rounded-lg">
            <details>
              <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-white rounded">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </details>
          </div>
        </div>
      </LayoutComponent>
    </Suspense>
  );
};