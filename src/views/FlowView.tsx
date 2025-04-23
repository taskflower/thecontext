// src/views/FlowView.tsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getLayoutComponent,
  getFlowStepComponent,
  getFlowStepForNodeType,
} from "../tpl";  // Zaktualizowana ścieżka importu
import { useNodeManager } from "../hooks/useNodeManager";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

const FlowView: React.FC = () => {
  // Pobierz parametry z URL
  const { workspace, scenario } = useParams<{
    workspace: string;
    scenario: string;
  }>();

  // Pobierz funkcje ze store
  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
  } = useWorkspaceStore();

  // Ustaw workspace i scenariusz na podstawie URL
  useEffect(() => {
    if (workspace) {
      selectWorkspace(workspace);
    }

    if (scenario) {
      selectScenario(scenario);
    }
  }, [workspace, scenario, selectWorkspace, selectScenario]);

  // Pobierz aktualny workspace
  const currentWorkspace = getCurrentWorkspace();
  
  // Używamy node managera do obsługi logiki przepływu
  const {
    currentNode,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    contextItems,
    currentScenario,
  } = useNodeManager();

  // Jeśli dane nie są jeszcze załadowane
  if (!currentWorkspace || !currentScenario) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Loading data... (Missing workspace or scenario)</p>
      </div>
    );
  }

  // Jeśli nie ma aktualnego node'a
  if (!currentNode) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <p>Error: No node found for the current flow.</p>
      </div>
    );
  }

  // Pobierz komponent layoutu na podstawie ustawień workspace'a
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings?.layoutTemplate || "default"
  );

  // Pobierz komponent kroku na podstawie ustawień węzła
  let FlowStepComponent;
  if (currentNode.templateId) {
    FlowStepComponent = getFlowStepComponent(currentNode.templateId);
  } else if (currentNode.type) {
    const flowStep = getFlowStepForNodeType(currentNode.type);
    FlowStepComponent = flowStep?.component;
  }

  // Jeśli brakuje komponentów, pokaż błąd
  if (!LayoutComponent) {
    return <div>Error: Layout component not found.</div>;
  }

  if (!FlowStepComponent) {
    return <div>Error: Flow step component not found.</div>;
  }

  // Renderuj layout i komponent kroku
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