// src/modules/flowPlayer/hooks/useFlowPlayer.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import { FlowNode } from "../../flow/types";
import { calculateFlowPath } from "../flowUtils";

// Control whether to clear conversation history when opening flow
const CLEAR_HISTORY_ON_OPEN = true;

export interface FlowPlayerContext {
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  userMessage: string;
  nextNode: () => void;
  previousNode: () => void;
  resetFlow: () => void;
  updateUserMessage: (value: string) => void;
  // Nowe metody do zarządzania wiadomościami
  isNodeProcessed: (nodeId: string) => boolean;
  markNodeAsProcessed: (nodeId: string) => void;
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
  
  // Śledzenie przetworzonych nodeId (używamy useRef aby uniknąć re-renderów)
  const processedNodesRef = useRef<Set<string>>(new Set());

  // Current node
  const currentNode = flowPath.length > 0 && currentNodeIndex < flowPath.length 
    ? flowPath[currentNodeIndex] 
    : null;

  // Czysty scenariusz
  const scenarioIdRef = useRef<string | null>(null);
  
  // Sprawdź, czy node był już przetworzony
  const isNodeProcessed = useCallback((nodeId: string) => {
    return processedNodesRef.current.has(nodeId);
  }, []);
  
  // Oznacz node jako przetworzony
  const markNodeAsProcessed = useCallback((nodeId: string) => {
    processedNodesRef.current.add(nodeId);
  }, []);

  // Reset flow
  const resetFlow = useCallback(() => {
    // First clear everything
    clearConversation();
    processedNodesRef.current.clear();
    setCurrentNodeIndex(0);
    setUserMessage("");

    // Then initialize with the first node
    if (flowPath.length > 0) {
      const firstNode = flowPath[0];
      selectNode(firstNode.id);
      
      // Explicitly add the first assistant message if it exists
      if (firstNode.assistant) {
        addToConversation({
          role: "assistant",
          message: firstNode.assistant
        });
        processedNodesRef.current.add(firstNode.id);
      }
    }
  }, [flowPath, clearConversation, selectNode, addToConversation]);

  // Inicjalizacja lub zmiana scenariusza
  useEffect(() => {
    // Wykryj zmianę scenariusza
    if (scenario?.id && scenario.id !== scenarioIdRef.current) {
      scenarioIdRef.current = scenario.id;
      
      if (CLEAR_HISTORY_ON_OPEN) {
        // Use resetFlow to handle initialization consistently
        resetFlow();
      } else if (flowPath.length > 0) {
        // Just select the first node without clearing history
        const firstNode = flowPath[0];
        selectNode(firstNode.id);
        setCurrentNodeIndex(0);
        
        // Explicitly process first node if not already processed
        if (firstNode.assistant && !processedNodesRef.current.has(firstNode.id)) {
          addToConversation({
            role: "assistant",
            message: firstNode.assistant
          });
          processedNodesRef.current.add(firstNode.id);
        }
      }
    }
  }, [scenario?.id, flowPath, resetFlow, selectNode, addToConversation]);
  
  // Synchronizacja gdy zmienia się wybrany node
  useEffect(() => {
    if (selected.node && flowPath.length > 0) {
      const nodeIndex = flowPath.findIndex((node) => node.id === selected.node);
      if (nodeIndex !== -1 && nodeIndex !== currentNodeIndex) {
        setCurrentNodeIndex(nodeIndex);
        setUserMessage("");
      }
    }
  }, [selected.node, flowPath, currentNodeIndex]);

  // Następny node
  const nextNode = useCallback(() => {
    if (currentNodeIndex >= flowPath.length - 1 || !currentNode) return;
  
    // Zapisz aktualną wiadomość użytkownika do konwersacji
    if (userMessage.trim()) {
      addToConversation({
        role: "user",
        message: userMessage
      });
    }
  
    // Przejdź do następnego node'a
    const newIndex = currentNodeIndex + 1;
    setCurrentNodeIndex(newIndex);
    setUserMessage("");
  
    // Zaznacz nowy node w UI
    const nextNodeObj = flowPath[newIndex];
    selectNode(nextNodeObj.id);
  }, [currentNode, currentNodeIndex, flowPath, userMessage, addToConversation, selectNode]);

  // Poprzedni node
  const previousNode = useCallback(() => {
    if (currentNodeIndex <= 0 || !currentNode) return;

    const newIndex = currentNodeIndex - 1;
    setCurrentNodeIndex(newIndex);
    setUserMessage("");
    
    // Zaznacz node w UI
    selectNode(flowPath[newIndex].id);
  }, [currentNode, currentNodeIndex, flowPath, selectNode]);

  // Aktualizacja wiadomości użytkownika
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
    updateUserMessage,
    isNodeProcessed,
    markNodeAsProcessed
  };
};