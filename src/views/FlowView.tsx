import React, { useEffect, Suspense, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { LoadingState } from "@/components/LoadingState";
import SharedLoader from "@/components/SharedLoader";
import { useAppNavigation, useNodeManager, useWorkspaceStore } from "@/hooks";
import {
  MissingComponentError,
  MissingLayoutError,
  MissingNodeError,
  MissingWorkspaceError,
} from "./flowViewMessages";

const FlowView: React.FC = () => {
  const navigation = useAppNavigation();
  const { workspace, scenario } = useParams();
  const {
    getCurrentWorkspace,
    selectWorkspace,
    selectScenario,
    isLoading: workspaceLoading,
    error: workspaceError,
  } = useWorkspaceStore();
  
  const [layoutComponent, setLayoutComponent] = useState<React.ComponentType<any> | null>(null);
  const [flowStepComponent, setFlowStepComponent] = useState<React.ComponentType<any> | null>(null);
  const [componentError, setComponentError] = useState<string | null>(null);

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

  // Get template name from workspace settings
  const templateName = currentWorkspace?.templateSettings?.template || 
                     currentWorkspace?.templateSettings?.layoutTemplate || 
                     "default";

  // Load layout component dynamically
  const loadLayoutComponent = useCallback(async () => {
    if (!templateName) return;
    
    try {
      setComponentError(null);
      // Using dynamic import for layout component
      const layoutPath = `/src/templates/${templateName}/layouts/SimpleLayout.tsx`;
      const modules = import.meta.glob("/src/templates/*/layouts/*.tsx");
      
      if (!modules[layoutPath]) {
        throw new Error(`Layout ${layoutPath} not found`);
      }

      const module = await modules[layoutPath]();
      setLayoutComponent(() => module.default);
    } catch (error) {
      console.error("Error loading layout component:", error);
      setComponentError(`Failed to load layout: ${error instanceof Error ? error.message : String(error)}`);
      setLayoutComponent(null);
    }
  }, [templateName]);

  // Load flow step component dynamically based on node type or template
  const loadFlowStepComponent = useCallback(async () => {
    if (!currentNode || !templateName) return;
    
    try {
      setComponentError(null);
      let componentType: string;
      
      // Determine component type
      if (currentNode.templateId) {
        componentType = currentNode.templateId;
      } else if (currentNode.template) {
        // Convert template name to proper format (e.g., "form-step" to "FormStep")
        componentType = currentNode.template
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
      } else if (currentNode.type) {
        componentType = currentNode.type
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('');
      } else {
        throw new Error(`No template or type specified for node ${currentNode.id}`);
      }
      
      // Construct path and import component
      const componentPath = `/src/templates/${templateName}/flowSteps/${componentType}Template.tsx`;
      const modules = import.meta.glob("/src/templates/*/flowSteps/*.tsx");
      
      if (!modules[componentPath]) {
        // Try alternative paths if first one fails
        const alternativePaths = [
          `/src/templates/${templateName}/flowSteps/${componentType}.tsx`,
          `/src/templates/${templateName}/components/${componentType}.tsx`,
          `/src/templates/default/flowSteps/${componentType}Template.tsx`,
          `/src/templates/default/flowSteps/${componentType}.tsx`
        ];
        
        let found = false;
        for (const path of alternativePaths) {
          if (modules[path]) {
            const module = await modules[path]();
            setFlowStepComponent(() => module.default);
            found = true;
            break;
          }
        }
        
        if (!found) {
          throw new Error(`Component ${componentType} not found in any expected location`);
        }
      } else {
        const module = await modules[componentPath]();
        setFlowStepComponent(() => module.default);
      }
    } catch (error) {
      console.error("Error loading flow step component:", error);
      setComponentError(`Failed to load flow step component: ${error instanceof Error ? error.message : String(error)}`);
      setFlowStepComponent(null);
    }
  }, [currentNode, templateName]);

  // Load components when dependencies change
  useEffect(() => {
    if (currentWorkspace) {
      loadLayoutComponent();
    }
  }, [currentWorkspace, loadLayoutComponent]);

  useEffect(() => {
    if (currentNode) {
      loadFlowStepComponent();
    }
  }, [currentNode, loadFlowStepComponent]);

  // Use workspace loading and error states
  const isLoading = workspaceLoading;
  const error = workspaceError || componentError;

  // Fallback loader for Suspense
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

    if (!layoutComponent) {
      return (
        <MissingLayoutError
          layoutName={templateName}
        />
      );
    }

    if (!flowStepComponent) {
      return (
        <MissingComponentError
          componentId={currentNode.template || currentNode.templateId || currentNode.type || "unknown"}
          nodeId={currentNode.id}
        />
      );
    }

    return React.createElement(layoutComponent, {
      title: currentScenario.name,
      stepTitle: currentNode.label,
      onBackClick: navigation.navigateToScenarios,
      children: React.createElement(flowStepComponent, {
        node: currentNode,
        onSubmit: handleNodeExecution,
        onPrevious: handlePreviousNode,
        isLastNode: isLastNode || false,
        isFirstNode: isFirstNode || false,
        contextItems: contextItems,
        scenario: currentScenario,
        stepTitle: currentNode.label
      })
    });
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