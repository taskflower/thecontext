// src/views/FlowView.tsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { getLayoutComponent, getFlowStepComponent, getFlowStepForNodeType } from "../lib/templates";
import { useContextStore } from "../lib/contextStore";
import { DebugPanel } from "../components/DebugPanel";
import { useNodeManager } from "../hooks/useNodeManager"; // Dodajemy hook useNodeManager
import ContextDebugger from "@/components/ContextDebugger";

export const FlowView: React.FC = () => {
  const { workspace: workspaceId, scenario: scenarioId } = useParams<{
    workspace: string;
    scenario: string;
  }>();
  const navigate = useNavigate();

  // Pobierz dane z Zustand store
  const { workspaces, selectWorkspace, selectScenario } = useAppStore();
  const { setActiveWorkspace } = useContextStore(); // Dostęp tylko do setActiveWorkspace
  
  console.log("FlowView mounted with params:", { workspaceId, scenarioId });
  
  // Sprawdźmy dostępne workspaces
  console.log("Available workspaces:", workspaces.map(w => ({ 
    id: w.id, 
    hasInitialContext: !!w.initialContext,
    initialContextKeys: w.initialContext ? Object.keys(w.initialContext) : []
  })));
  
  // Ustaw aktywny workspace i scenariusz
  useEffect(() => {
    console.log("FlowView useEffect triggered with:", { workspaceId, scenarioId });
    
    if (workspaceId) {
      console.log("Selecting workspace:", workspaceId);
      selectWorkspace(workspaceId);
      
      // Sprawdź czy workspace ma initialContext
      const workspace = workspaces.find(w => w.id === workspaceId);
      console.log("Found workspace:", workspace ? {
        id: workspace.id,
        hasInitialContext: !!workspace.initialContext,
        initialContextKeys: workspace.initialContext ? Object.keys(workspace.initialContext) : []
      } : "none");
      
      // Ustaw aktywny workspace w contextStore
      console.log("Setting active workspace in contextStore:", workspaceId);
      setActiveWorkspace(workspaceId);
    }

    if (scenarioId) {
      console.log("Selecting scenario:", scenarioId);
      selectScenario(scenarioId);
    }
  }, [workspaceId, scenarioId, selectWorkspace, selectScenario, setActiveWorkspace, workspaces]);

  // Używamy hooka useNodeManager zamiast powielać logikę
  const {
    currentNode,
    currentScenario,
    isLastNode,
    handlePreviousNode,
    handleNodeExecution,
    debugInfo,
    contextItems
  } = useNodeManager();

  console.log("useNodeManager result:", {
    hasCurrentNode: !!currentNode,
    hasCurrentScenario: !!currentScenario,
    isLastNode,
    contextItemsCount: contextItems ? contextItems.length : 0
  });
  
  if (debugInfo) {
    console.log("Debug info:", debugInfo);
  }

  // Jeśli nie mamy danych, wyświetl komunikat ładowania
  if (!currentNode || !currentScenario) {
    console.log("No current node or scenario, showing loading");
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading node data...</p>
        </div>
      </div>
    );
  }

  // Znajdź aktualny workspace
  const currentWorkspace = workspaces.find(w => w.id === workspaceId);
  console.log("Current workspace:", currentWorkspace ? {
    id: currentWorkspace.id,
    hasInitialContext: !!currentWorkspace.initialContext,
    templateSettings: currentWorkspace.templateSettings
  } : "none");

  // Pobierz komponent kroku flow na podstawie typu node'a lub templateId
  let FlowStepComponent;
  if (currentNode.templateId) {
    // Jeśli node ma określony templateId, użyj go
    console.log("Getting FlowStepComponent by templateId:", currentNode.templateId);
    FlowStepComponent = getFlowStepComponent(currentNode.templateId);
  } else {
    // W przeciwnym razie spróbuj znaleźć komponent na podstawie typu
    console.log("Getting FlowStepComponent by node type:", currentNode.type);
    FlowStepComponent = getFlowStepForNodeType(currentNode.type)?.component;
  }

  console.log("Found FlowStepComponent:", !!FlowStepComponent);

  // Jeśli nie znaleziono komponentu
  if (!FlowStepComponent) {
    console.log("No FlowStepComponent found, showing error");
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Flow step template not found for type: {currentNode.type} and templateId: {currentNode.templateId}</p>
        </div>
      </div>
    );
  }

  // Pobierz komponent layoutu
  console.log("Getting layout component for template:", currentWorkspace?.templateSettings.layoutTemplate || "default");
  const LayoutComponent = getLayoutComponent(
    currentWorkspace?.templateSettings.layoutTemplate || "default"
  );

  console.log("Found LayoutComponent:", !!LayoutComponent);

  // Jeśli nie znaleziono layoutu
  if (!LayoutComponent) {
    console.log("No LayoutComponent found, showing error");
    return (
      <div className="min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Layout template not found</p>
        </div>
      </div>
    );
  }

  console.log("Rendering flow view with components");
  
  // Renderuj layout z komponentem flow step
  return (
    <>
      <LayoutComponent
        title={currentNode.label}
        showBackButton={true}
        onBackClick={handlePreviousNode}
      >
        <FlowStepComponent
          node={currentNode}
          onSubmit={handleNodeExecution}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode}
          contextItems={contextItems} // Przekazujemy contextItems do komponentu
        />
      </LayoutComponent>

      {/* Debugger - wydzielony do osobnego komponentu */}
      <DebugPanel 
        nodeData={debugInfo}
      />
      <ContextDebugger/>
    </>
  );
};

export default FlowView;