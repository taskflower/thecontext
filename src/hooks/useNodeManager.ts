// src/hooks/useNodeManager.ts
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { useContextStore } from "../lib/contextStore";

export function useNodeManager() {
  const navigate = useNavigate();
  const { getCurrentWorkspace, getCurrentScenario } = useAppStore();
  const context = useContextStore(state => state.context);
  const updateContext = useContextStore(state => state.updateContext);
  const updateContextPath = useContextStore(state => state.updateContextPath);
  const setActiveWorkspace = useContextStore(state => state.setActiveWorkspace);

  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  
  // Get nodes safely, with fallback to empty array
  const nodes = currentScenario?.nodes || [];
  
  // Get current node or undefined if not available
  const currentNode = nodes.length > currentNodeIndex ? nodes[currentNodeIndex] : undefined;
  
  // Check if we're on the last node
  const isLastNode = currentNodeIndex === nodes.length - 1;

  // Logging for debugging
  useEffect(() => {
    console.log("[useNodeManager] State:", {
      currentWorkspaceId: currentWorkspace?.id,
      currentScenarioId: currentScenario?.id,
      nodesCount: nodes.length,
      currentNodeIndex,
      currentNodeId: currentNode?.id
    });
  }, [currentWorkspace, currentScenario, nodes, currentNodeIndex, currentNode]);

  // Set active workspace in contextStore when it changes
  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log("[useNodeManager] Setting active workspace:", currentWorkspace.id);
      setActiveWorkspace(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, setActiveWorkspace]);

  // Reset node index when scenario changes
  useEffect(() => {
    console.log("[useNodeManager] Scenario changed, resetting node index");
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  // Get current context entries
  const contextItems = Object.entries(context || {});

  // Go back to scenarios list
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      console.log("[useNodeManager] Navigating to scenarios list");
      navigate(`/${currentWorkspace.id}`);
    } else {
      console.log("[useNodeManager] No workspace, navigating to root");
      navigate('/');
    }
  };

  // Go to previous node or scenarios list
  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      console.log("[useNodeManager] Moving to previous node:", currentNodeIndex - 1);
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
    
    console.log("[useNodeManager] Executing node:", currentNode.type, "value:", value);

    // Handle basic input nodes
    if ((currentNode.type === "input" || !currentNode.type) && 
        currentNode.contextKey && 
        currentNode.contextJsonPath) {
      console.log(`[useNodeManager] Updating context path ${currentNode.contextKey}.${currentNode.contextJsonPath}`);
      updateContextPath(
        currentNode.contextKey,
        currentNode.contextJsonPath,
        value
      );
    } 
    // Handle form nodes
    else if (currentNode.type === "form" && currentNode.contextKey) {
      console.log("[useNodeManager] Updating form data for key:", currentNode.contextKey);
      if (typeof value === 'object') {
        // Get existing context data for this key
        const formData = { ...(context[currentNode.contextKey] || {}) };
        
        // Update values from form
        Object.entries(value).forEach(([fieldPath, fieldValue]) => {
          const setPath = (obj: any, path: string, val: any) => {
            const keys = path.split('.');
            let current = obj;
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
              }
              current = current[key];
            }
            const lastKey = keys[keys.length - 1];
            current[lastKey] = val;
          };
          console.log(`[useNodeManager] Setting field ${fieldPath}:`, fieldValue);
          setPath(formData, fieldPath, fieldValue);
        });
        
        // Update context with new form data
        updateContext(currentNode.contextKey, formData);
      } else {
        console.warn("[useNodeManager] Unexpected form data format:", value);
      }
    } 
    // Handle other node types
    else if (currentNode.contextKey) {
      console.log("[useNodeManager] Updating context key:", currentNode.contextKey);
      updateContext(currentNode.contextKey, value);
    }

    // Handle navigation
    if (isLastNode) {
      console.log("[useNodeManager] Last node reached, returning to scenarios list");
      handleGoToScenariosList();
    } else {
      console.log("[useNodeManager] Moving to next node:", currentNodeIndex + 1);
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
    context
  };

  return {
    currentNode,
    currentScenario,
    isLastNode,
    handleGoToScenariosList,
    handlePreviousNode,
    handleNodeExecution,
    debugInfo,
    contextItems
  };
}