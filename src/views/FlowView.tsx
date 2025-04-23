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
import { useContextStore } from "@/hooks/useContextStore";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";

// Local storage key for flow state
const FLOW_STATE_KEY = "wiseads_flow_state";

const FlowView: React.FC = () => {
  const { workspace, scenario, application } = useParams<{
    workspace: string;
    scenario: string;
    application?: string;
  }>();
  const navigate = useNavigate();

  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceStore();

  const contextStore = useContextStore();

  // Select workspace and scenario when component mounts
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
    isFirstNode,
    handlePreviousNode,
    handleNodeExecution,
    contextItems,
    currentScenario,
  } = useNodeManager();

  // When the flow changes (new scenario), try to restore saved state
  useEffect(() => {
    if (workspace && scenario && currentWorkspace) {
      try {
        // Generate a unique key for this flow
        const flowKey = `${FLOW_STATE_KEY}_${workspace}_${scenario}`;
        const savedState = localStorage.getItem(flowKey);
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          // Restore context if available
          if (parsedState.context && workspace) {
            contextStore.setContexts({
              ...contextStore.contexts,
              [workspace]: {
                ...contextStore.contexts[workspace],
                ...parsedState.context
              }
            });
          }
        }
      } catch (error) {
        console.error("Error restoring flow state:", error);
      }
    }
  }, [workspace, scenario, currentWorkspace]);

  // Save flow state when node execution occurs
  const handleNodeExecutionWithSave = (data: any) => {
    // First handle the standard node execution
    handleNodeExecution(data);
    
    // Then save the current state to local storage
    if (workspace && scenario) {
      try {
        const flowKey = `${FLOW_STATE_KEY}_${workspace}_${scenario}`;
        const stateToSave = {
          lastUpdated: new Date().toISOString(),
          context: contextStore.contexts[workspace],
        };
        localStorage.setItem(flowKey, JSON.stringify(stateToSave));
      } catch (error) {
        console.error("Error saving flow state:", error);
      }
    }
  };

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
              onClick={() => {
                if (application && workspace) {
                  navigate(`/app/${application}/${workspace}`);
                } else if (workspace) {
                  navigate(`/${workspace}`);
                } else {
                  navigate("/");
                }
              }}
              className="ml-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do scenariuszy
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
              onClick={() => {
                if (application && workspace) {
                  navigate(`/app/${application}/${workspace}`);
                } else if (workspace) {
                  navigate(`/${workspace}`);
                } else {
                  navigate("/");
                }
              }}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Wróć do scenariuszy
            </button>
          </div>
        </div>
      );
    }

    return (
      <LayoutComponent
        title={currentScenario.name}
        stepTitle={currentNode.label}
        onBackClick={() => {
          if (application && workspace) {
            navigate(`/app/${application}/${workspace}`);
          } else if (workspace) {
            navigate(`/${workspace}`);
          } else {
            navigate("/");
          }
        }}
      >
        <FlowStepComponent
          key={currentNode.id}
          node={currentNode}
          onSubmit={handleNodeExecutionWithSave}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode}
          isFirstNode={isFirstNode}
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