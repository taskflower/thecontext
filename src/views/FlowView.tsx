// src/views/FlowView.tsx
import React, { useEffect, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getLayoutComponent,
  getFlowStepComponent,
  getFlowStepForNodeType,
} from "../tpl";
import { useNodeManager } from "../hooks/useNodeManager";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";

const FlowView: React.FC = () => {
  const { workspace, scenario } = useParams<{
    workspace: string;
    scenario: string;
  }>();
  const navigate = useNavigate();

  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceStore();

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

  // Use workspace loading and error states
  const isLoading = workspaceLoading;
  const error = workspaceError;

  // Fallback loader for Suspense
  const fallbackLoader = (
    <SharedLoader message="Ładowanie komponentów..." fullScreen={true} />
  );

  const renderContent = () => {
    if (!currentWorkspace || !currentScenario) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg">
            Brak danych workspace lub scenariusza.
            <button
              onClick={() => navigate("/")}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do listy aplikacji
            </button>
          </div>
        </div>
      );
    }

    if (!currentNode) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg">
            Błąd: Nie znaleziono node dla aktualnego flow.
            <button
              onClick={() => navigate(`/app/${workspace}`)}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do workspace
            </button>
          </div>
        </div>
      );
    }

    const LayoutComponent = getLayoutComponent(
      currentWorkspace.templateSettings?.layoutTemplate || "default"
    );

    let FlowStepComponent;
    let componentId = "nieznany";

    if (currentNode.templateId) {
      componentId = currentNode.templateId;
      FlowStepComponent = getFlowStepComponent(componentId);
    } else if (currentNode.type) {
      componentId = currentNode.type;
      FlowStepComponent = getFlowStepForNodeType(componentId);
    }

    if (!LayoutComponent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            <h3 className="font-bold">
              Błąd: Nie znaleziono komponentu layoutu
            </h3>
            <p className="mt-2">
              Szukany layout:{" "}
              <span className="font-mono bg-red-50 px-1">
                {currentWorkspace.templateSettings?.layoutTemplate || "default"}
              </span>
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do listy aplikacji
            </button>
          </div>
        </div>
      );
    }

    if (!FlowStepComponent) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-600 text-lg p-4 bg-red-100 rounded-lg">
            <h3 className="font-bold">
              Błąd: Nie znaleziono komponentu flow step
            </h3>
            <p className="mt-2">
              Szukany komponent:{" "}
              <span className="font-mono bg-red-50 px-1">{componentId}</span>
            </p>
            <p className="mt-2">
              ID węzła:{" "}
              <span className="font-mono bg-red-50 px-1">{currentNode.id}</span>
            </p>
            <p className="mt-2">
              Sprawdź w konsoli przeglądarki listę dostępnych komponentów (F12
              Console)
            </p>
            <button
              onClick={() => navigate(`/app/${workspace}`)}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do workspace
            </button>
          </div>
        </div>
      );
    }

    return (
      <LayoutComponent
        title={currentScenario.name}
        stepTitle={currentNode.label}
      >
        <FlowStepComponent
          key={currentNode.id}
          node={currentNode}
          onSubmit={handleNodeExecution}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode}
          contextItems={contextItems}
          scenario={currentScenario}
          stepTitle={currentNode.label}
        />
      </LayoutComponent>
    );
  };

  return (
    <Suspense fallback={fallbackLoader}>
      <LoadingState
        isLoading={isLoading}
        error={error}
        loadingMessage="Ładowanie flow..."
        errorTitle="Błąd ładowania flow"
        onRetry={() => {
          if (workspace) selectWorkspace(workspace);
          if (scenario) selectScenario(scenario);
        }}
      >
        {renderContent()}
      </LoadingState>
    </Suspense>
  );
};

export default FlowView;
