// src/views/FlowView.tsx

// TODO - dostrzegam tutaj logike ktora prowdopodobnie służy do zapisu sesji dla kroku flow,
// jednak to nie dzieje sie w praktyce wiec treba to wypierdolic

import React, { useEffect, Suspense, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  getLayoutComponent,
  getFlowStepComponent,
  getFlowStepForNodeType,
} from "../tpl";

import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import { NodeData } from "@/types";
import {
  useAppNavigation,
  useContextStore,
  useNodeManager,
  useWorkspaceStore,
} from "@/hooks";
import {
  MissingComponentError,
  MissingLayoutError,
  MissingNodeError,
  MissingWorkspaceError,
} from "./flowViewMessages";

// Local storage key for flow state
const FLOW_STATE_KEY = "wiseads_flow_state";

const FlowView: React.FC = () => {
  const { workspace, scenario } = useParams();

  // Ref, aby zapobiec nieskończonym renderowaniom
  const contextInitialized = useRef(false);

  // Hooki z logiką biznesową
  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceStore();

  const contextStore = useContextStore();
  const navigation = useAppNavigation();

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
    if (
      workspace &&
      scenario &&
      currentWorkspace &&
      !contextInitialized.current
    ) {
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
                ...parsedState.context,
              },
            });
            // Oznacz, że już zainicjalizowano kontekst, aby uniknąć pętli
            contextInitialized.current = true;
          }
        }
      } catch (error) {
        console.error("Error restoring flow state:", error);
      }
    }
  }, [
    workspace,
    scenario,
    currentWorkspace,
    contextStore.contexts,
    contextStore,
  ]);

  // Save flow state when node execution occurs
  const handleNodeExecutionWithSave = (data: any) => {
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

  // Fallback loader dla Suspense
  const fallbackLoader = (
    <SharedLoader message="Ładowanie komponentów..." fullScreen={true} />
  );

  const renderContent = () => {
    if (!currentWorkspace || !currentScenario) {
      return <MissingWorkspaceError />;
    }

    if (!currentNode) {
      return <MissingNodeError />;
    }

    const LayoutComponent = getLayoutComponent(
      currentWorkspace.templateSettings?.layoutTemplate || "default"
    );

    if (!LayoutComponent) {
      return (
        <MissingLayoutError
          layoutName={
            currentWorkspace.templateSettings?.layoutTemplate || "default"
          }
        />
      );
    }

    let FlowStepComponent;
    let componentId = "nieznany";

    if (currentNode.templateId) {
      componentId = currentNode.templateId;
      FlowStepComponent = getFlowStepComponent(componentId);
    } else if (currentNode.type) {
      componentId = currentNode.type;
      FlowStepComponent = getFlowStepForNodeType(componentId);
    }

    if (!FlowStepComponent) {
      return (
        <MissingComponentError
          componentId={componentId}
          nodeId={currentNode.id}
        />
      );
    }

    return (
      <LayoutComponent
        title={currentScenario.name}
        stepTitle={currentNode.label}
        onBackClick={navigation.navigateToScenarios}
      >
        <FlowStepComponent
          node={currentNode as NodeData}
          onSubmit={handleNodeExecutionWithSave}
          onPrevious={handlePreviousNode}
          isLastNode={isLastNode || false}
          isFirstNode={isFirstNode || false}
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
