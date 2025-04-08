// src/views/FlowView.tsx
import React, { Suspense } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { useNodeManager } from '../hooks/useNodeManager';
import { templateRegistry } from '../lib/templates'; // Zaktualizowany import

export const FlowView: React.FC = () => {
  const { workspace: workspaceId } = useParams<{ workspace: string }>();
  const { workspaces } = useAppStore();

  const {
    currentNode,
    isLastNode,
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
    return <div className="p-4">Layout template not found</div>;
  }

  if (!debugInfo.workspaceId) return <div className="p-4">No workspace selected</div>;
  if (!debugInfo.scenarioId) return <div className="p-4">No scenario selected</div>;
  if (!currentNode) return <div className="p-4">No current node available</div>;

  // Get appropriate flow step template for this node
  const nodeTemplateId = currentNode.templateId || currentWorkspace.templateSettings.defaultFlowStepTemplate;
  const FlowStepComponent = templateRegistry.getFlowStep(nodeTemplateId)?.component;

  if (!FlowStepComponent) {
    return <div className="p-4">Flow step template not found</div>;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Ładowanie szablonów...</p>
        </div>
      </div>
    }>
      <LayoutComponent 
        title={`Flow: ${currentNode.label}`}
        showBackButton={true}
        onBackClick={handleGoToScenariosList}
      >
        <div className="space-y-4">
          <FlowStepComponent
            node={currentNode}
            onSubmit={handleNodeExecution}
            onPrevious={handlePreviousNode}
            isLastNode={isLastNode}
            contextItems={debugInfo.contextItems}
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