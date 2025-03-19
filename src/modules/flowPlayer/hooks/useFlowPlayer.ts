// src/modules/flowPlayer/hooks/useFlowPlayer.ts
import { useState, useCallback, useEffect, useRef } from "react";
import { useAppStore } from "../../store";
import { calculateFlowPath } from "../flowUtils";
import { useWorkspaceContext } from "../../context/hooks/useContext";
import { FlowNode } from "@/modules/flow/types";


// Control whether to clear conversation history when opening flow
const CLEAR_HISTORY_ON_OPEN = true;

export interface FlowPlayerContext {
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  userMessage: string;
  nextNode: (userMsg?: string) => void;
  previousNode: () => void;
  resetFlow: () => void;
  updateUserMessage: (value: string) => void;
  // Metody do zarządzania wiadomościami
  isNodeProcessed: (nodeId: string) => boolean;
  markNodeAsProcessed: (nodeId: string) => void;
}

export const useFlowPlayer = (): FlowPlayerContext => {
  const {
    getCurrentScenario,
    selectNode,
    addToConversation,
    clearConversation,
    selected,
  } = useAppStore();
  const { processTemplate } = useWorkspaceContext();

  // Get scenario nodes and edges
  const scenario = getCurrentScenario();
  const nodes = scenario?.children || [];
  const edges = scenario?.edges || [];

  // Calculate flow path
  const flowPath = calculateFlowPath(nodes, edges);

  // State for flow player
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [userMessage, setUserMessage] = useState("");

  // Śledzenie przetworzonych nodeId
  const processedNodesRef = useRef<Set<string>>(new Set());

  // Current node
  const currentNode =
    flowPath.length > 0 && currentNodeIndex < flowPath.length
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
    }
  }, [flowPath, clearConversation, selectNode]);

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
      }
    }
  }, [scenario?.id, flowPath, resetFlow, selectNode]);

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

  // Następny node - CAŁKOWICIE ZMIENIONY
  const nextNode = useCallback(
    (userMsg?: string) => {
      if (currentNodeIndex >= flowPath.length - 1 || !currentNode) return;

      
      // Obsługa wiadomości asystenta
      if (currentNode.assistant) {
        const processedAssistantMessage = processTemplate(
          currentNode.assistant
        );
        addToConversation({
          role: "assistant",
          message: processedAssistantMessage,
        });
      }

      // Obsługa wiadomości użytkownika, jeśli została podana
      if (userMsg?.trim()) {
        addToConversation({
          role: "user",
          message: processTemplate(userMsg),
        });
      }


      // Przejście do następnego node'a
      const newIndex = currentNodeIndex + 1;
      setCurrentNodeIndex(newIndex);
      setUserMessage("");

      const nextNodeObj = flowPath[newIndex];
      selectNode(nextNodeObj.id);
    },
    [
      currentNode,
      currentNodeIndex,
      flowPath,
      addToConversation,
      selectNode,
      processTemplate,
    ]
  );

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
    markNodeAsProcessed,
  };
};
