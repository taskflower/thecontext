// src/modules/flowPlayer/hooks/useFlowPlayer.ts
import { useState, useCallback, useEffect } from "react";
import { useAppStore } from "../../store";
import { FlowNode } from "../../flow/types";
import { calculateFlowPath } from "../flowUtils";

export interface FlowPlayerContext {
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  userMessage: string;
  nextNode: () => void;
  previousNode: () => void;
  resetFlow: () => void;
  updateUserMessage: (value: string) => void;
}

export const useFlowPlayer = (): FlowPlayerContext => {
  const { getCurrentScenario, selectNode, addToConversation, clearConversation, selected } = useAppStore();
  
  // Get scenario nodes and edges
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  const edges = scenario?.edges || [];

  // Calculate flow path
  const flowPath = calculateFlowPath(nodes, edges);
  
  // State for flow player
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [userMessage, setUserMessage] = useState("");

  // Current node
  const currentNode = flowPath.length > 0 && currentNodeIndex < flowPath.length 
    ? flowPath[currentNodeIndex] 
    : null;

  // Initialize with first node and handle node selection changes
  useEffect(() => {
    if (flowPath.length > 0 && currentNode) {
      // Add the first node's assistant message to conversation
      if (currentNode.assistant) {
        addToConversation({
          role: "assistant",
          message: currentNode.assistant
        });
      }
      // Select the first node
      selectNode(currentNode.id);
    }
  // Only run this effect once when the flow path is first calculated
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flowPath.length]);
  
  // Sync UI when node selection changes externally
  useEffect(() => {
    if (selected.node && flowPath.length > 0) {
      const nodeIndex = flowPath.findIndex((node) => node.id === selected.node);
      if (nodeIndex !== -1 && nodeIndex !== currentNodeIndex) {
        setCurrentNodeIndex(nodeIndex);
        setUserMessage("");
      }
    }
  }, [selected.node, flowPath, currentNodeIndex]);

  // Move to next node
  const nextNode = useCallback(() => {
    if (currentNodeIndex >= flowPath.length - 1 || !currentNode) return;
  
    // Save current user message to conversation
    if (userMessage.trim()) {
      addToConversation({
        role: "user",
        message: userMessage
      });
    }
  
    // Move to next node
    const newIndex = currentNodeIndex + 1;
    setCurrentNodeIndex(newIndex);
    setUserMessage("");
  
    // Select the node in UI
    const nextNodeObj = flowPath[newIndex];
    selectNode(nextNodeObj.id);
  }, [currentNode, currentNodeIndex, flowPath, userMessage, addToConversation, selectNode]);

  // Move to previous node
  const previousNode = useCallback(() => {
    if (currentNodeIndex <= 0 || !currentNode) return;

    const newIndex = currentNodeIndex - 1;
    setCurrentNodeIndex(newIndex);
    setUserMessage("");
    
    // Select the node in UI
    selectNode(flowPath[newIndex].id);
  }, [currentNode, currentNodeIndex, flowPath, selectNode]);

  // Reset flow
  const resetFlow = useCallback(() => {
    setCurrentNodeIndex(0);
    setUserMessage("");
    clearConversation();

    if (flowPath.length > 0) {
      const firstNode = flowPath[0];
      selectNode(firstNode.id);
      
      // Add first node's assistant message to conversation
      if (firstNode.assistant) {
        addToConversation({
          role: "assistant",
          message: firstNode.assistant
        });
      }
    }
  }, [flowPath, clearConversation, selectNode, addToConversation]);

  // Update user message
  const updateUserMessage = useCallback((value: string) => {
    setUserMessage(value);
  }, []);

  return {
    currentNode,
    currentNodeIndex,
    flowPath,
    userMessage,
    nextNode,
    previousNode,
    resetFlow,
    updateUserMessage
  };
};