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
  useNodeManager,
  useWorkspaceStore,
} from "@/hooks";
import {
  MissingComponentError,
  MissingLayoutError,
  MissingNodeError,
  MissingWorkspaceError,
} from "./flowViewMessages";



const FlowView: React.FC = () => {
  const { workspace, scenario } = useParams();

  

  // Hooki z logiką biznesową
  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceStore();


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

  // Save flow state when node execution occurs
  const handleNodeExecutionWithSave = (data: any) => {
    handleNodeExecution(data);
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
