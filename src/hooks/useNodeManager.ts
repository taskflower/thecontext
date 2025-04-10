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
  const nodes = currentScenario?.nodes || [];
  const currentNode = nodes[currentNodeIndex];
  const isLastNode = currentNodeIndex === nodes.length - 1;

  // Ustawienie aktywnego workspace’a w contextStore – tylko raz gdy się zmieni
  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log("[useNodeManager] Ustawianie aktywnego workspace:", currentWorkspace.id);
      setActiveWorkspace(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, setActiveWorkspace]);

  // Resetowanie indeksu node'a przy zmianie scenariusza
  useEffect(() => {
    console.log("[useNodeManager] Zmiana scenariusza, resetowanie indeksu node'a");
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  // Pobranie aktualnego kontekstu jako tablica wpisów
  const contextItems = Object.entries(context || {});

  // Obsługa powrotu do listy scenariuszy
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      console.log("[useNodeManager] Przejście do listy scenariuszy");
      navigate(`/${currentWorkspace.id}`);
    }
  };

  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      console.log("[useNodeManager] Przejście do poprzedniego node'a");
      setCurrentNodeIndex(currentNodeIndex - 1);
    } else {
      handleGoToScenariosList();
    }
  };

  const handleNodeExecution = (value: any) => {
    if (!currentNode) return;
    
    console.log("[useNodeManager] Wykonywanie node'a:", currentNode.type, "wartość:", value);

    if (
      (currentNode.type === "input" || !currentNode.type) &&
      currentNode.contextKey &&
      currentNode.contextJsonPath
    ) {
      console.log(`[useNodeManager] Aktualizacja ścieżki kontekstu ${currentNode.contextKey}.${currentNode.contextJsonPath}`);
      updateContextPath(
        currentNode.contextKey,
        currentNode.contextJsonPath,
        value
      );
    } else if (currentNode.type === "form" && currentNode.contextKey) {
      console.log("[useNodeManager] Aktualizacja formularza dla klucza:", currentNode.contextKey);
      if (typeof value === 'object') {
        const formData = { ...(context[currentNode.contextKey] || {}) };
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
          console.log(`[useNodeManager] Ustawianie pola ${fieldPath}:`, fieldValue);
          setPath(formData, fieldPath, fieldValue);
        });
        updateContext(currentNode.contextKey, formData);
      } else {
        console.warn("[useNodeManager] Nieoczekiwany format danych formularza:", value);
      }
    } else if (currentNode.contextKey) {
      console.log("[useNodeManager] Aktualizacja całego klucza kontekstu:", currentNode.contextKey);
      updateContext(currentNode.contextKey, value);
    }

    if (isLastNode) {
      console.log("[useNodeManager] Ostatni node osiągnięty, powrót do listy scenariuszy");
      handleGoToScenariosList();
    } else {
      console.log("[useNodeManager] Przejście do następnego node'a");
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  const debugInfo = {
    currentWorkspace: currentWorkspace?.id,
    currentScenario: currentScenario?.id,
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
