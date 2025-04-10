// src/hooks/useNodeManager.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";

export function useNodeManager() {
  const navigate = useNavigate();
  const {
    getCurrentWorkspace,
    getCurrentScenario,
    getContext,
    updateContext,
    updateContextPath,
    updateByContextPath, // New function
  } = useAppStore();

  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  const context = getContext();

  // Get nodes safely, with fallback to empty array
  const nodes = currentScenario?.nodes || [];

  // Get current node or undefined if not available
  const currentNode =
    nodes.length > currentNodeIndex ? nodes[currentNodeIndex] : undefined;

  // Check if we're on the last node
  const isLastNode = currentNodeIndex === nodes.length - 1;

  // Reset node index when scenario changes
  useEffect(() => {
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  // Get current context entries
  const contextItems = Object.entries(context || {});

  // Go back to scenarios list
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      navigate(`/${currentWorkspace.id}`);
    } else {
      navigate("/");
    }
  };

  // Go to previous node or scenarios list
  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    } else {
      handleGoToScenariosList();
    }
  };

  // Handle node execution with context updates
  const handleNodeExecution = (value: any) => {
    if (!currentNode) {
      console.warn("[useNodeManager] Cannot execute node: no current node");
      return;
    }

    // New approach: using contextPath
    if (currentNode.contextPath) {
      // Handle form data separately (because it's a complex object)
      if (
        (currentNode.type === "form" ||
          currentNode.templateId === "form-step") &&
        typeof value === "object"
      ) {
        // Get the base context key (part before first dot or the whole contextPath)
        const contextKey = currentNode.contextPath.split(".")[0];

        // Get existing data for this context key
        const existingData = context[contextKey] || {};
        const formData = { ...existingData };

        // Update values from form
        Object.entries(value).forEach(([fieldPath, fieldValue]) => {
          const setNestedPath = (obj: any, path: string, val: any) => {
            const keys = path.split(".");
            let current = obj;

            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (typeof current[key] !== "object" || current[key] === null) {
                current[key] = {};
              }
              current = current[key];
            }

            const lastKey = keys[keys.length - 1];
            current[lastKey] = val;
          };

          setNestedPath(formData, fieldPath, fieldValue);
        });

        updateContext(contextKey, formData);
      }
      // Simple value - use the new helper function
      else {
        updateByContextPath(currentNode.contextPath, value);
      }
    }
    // Legacy approach: using contextKey and contextJsonPath
    else if (currentNode.contextKey) {
      // Handle basic input nodes with contextJsonPath
      if (
        (currentNode.type === "input" || !currentNode.type) &&
        currentNode.contextKey &&
        currentNode.contextJsonPath
      ) {
        updateContextPath(
          currentNode.contextKey,
          currentNode.contextJsonPath,
          value
        );
      }
      // Handle form nodes
      else if (
        currentNode.type === "form" ||
        currentNode.templateId === "form-step"
      ) {
        if (typeof value === "object") {
          // Get existing context data for this key
          const existingContextData = context[currentNode.contextKey] || {};
          const formData = { ...existingContextData };

          // Update values from form
          Object.entries(value).forEach(([fieldPath, fieldValue]) => {
            const setPath = (obj: any, path: string, val: any) => {
              const keys = path.split(".");
              let current = obj;
              for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (typeof current[key] !== "object" || current[key] === null) {
                  current[key] = {};
                }
                current = current[key];
              }
              const lastKey = keys[keys.length - 1];
              current[lastKey] = val;
            };

            setPath(formData, fieldPath, fieldValue);
          });

          // Update context with new form data

          updateContext(currentNode.contextKey, formData);
        } else {
          console.warn("[useNodeManager] Unexpected form data format:", value);
        }
      }
      // Handle other node types with contextKey only
      else {
        updateContext(currentNode.contextKey, value);
      }
    }

    // Handle navigation
    if (isLastNode) {
      handleGoToScenariosList();
    } else {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  // Debugging info
  const debugInfo = {
    currentWorkspaceId: currentWorkspace?.id,
    currentScenarioId: currentScenario?.id,
    currentNodeIndex,
    nodeCount: nodes.length,
    currentNodeId: currentNode?.id,
    context,
  };

  return {
    currentNode,
    currentScenario,
    isLastNode,
    handleGoToScenariosList,
    handlePreviousNode,
    handleNodeExecution,
    debugInfo,
    contextItems,
  };
}
