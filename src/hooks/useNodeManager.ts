// src/hooks/useNodeManager.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { useContextStore } from "../lib/contextStore";

// Helper function to set a value at a nested path in an object
function setPath(obj: Record<string, any>, path: string, value: any): void {
  const keys = path.split('.');
  let current = obj;
  
  // Navigate through all keys except the last one
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    
    // If the key doesn't exist or isn't an object, create a new one
    if (typeof current[key] !== 'object' || current[key] === null) {
      current[key] = {};
    }
    
    current = current[key];
  }
  
  // Set the value at the last key
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

export function useNodeManager() {
  const navigate = useNavigate();
  const { getCurrentWorkspace, getCurrentScenario } = useAppStore();
  const { updateContext, updateContextPath } = useContextStore();

  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  const nodes = currentScenario?.nodes || [];
  const currentNode = nodes[currentNodeIndex];
  const isLastNode = currentNodeIndex === nodes.length - 1;

  useEffect(() => {
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  const context = useContextStore((state) => state.context);
  const contextItems = Object.entries(context);

  // Obsługa powrotu do listy scenariuszy
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      navigate(`/${currentWorkspace.id}`);
    }
  };

  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    }
  };

  const handleNodeExecution = (value: any) => {
    if (!currentNode) return;

    if (
      currentNode.type === "input" &&
      currentNode.contextKey &&
      currentNode.contextJsonPath
    ) {
      updateContextPath(
        currentNode.contextKey,
        currentNode.contextJsonPath,
        value
      );
    } else if (currentNode.type === "form" && currentNode.contextKey) {
      // For form type nodes, update multiple fields in the context
      const keyData = { ...context[currentNode.contextKey] };
      Object.entries(value).forEach(([fieldPath, fieldValue]) => {
        setPath(keyData, fieldPath, fieldValue);
      });
      updateContext(currentNode.contextKey, keyData);
    }

    if (isLastNode) {
      handleGoToScenariosList();
    } else {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  // Debug info dla deweloperów
  const debugInfo = {
    currentWorkspace: currentWorkspace?.id,
    currentScenario: currentScenario?.id,
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