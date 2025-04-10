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
  const { updateContext, updateContextPath, context, setActiveWorkspace } = useContextStore();

  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  const nodes = currentScenario?.nodes || [];
  const currentNode = nodes[currentNodeIndex];
  const isLastNode = currentNodeIndex === nodes.length - 1;

  // Ustawienie aktywnego workspace'a w contextStore, gdy się zmieni
  useEffect(() => {
    if (currentWorkspace?.id) {
      setActiveWorkspace(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, setActiveWorkspace]);

  // Resetowanie indeksu node'a, gdy zmieni się scenariusz
  useEffect(() => {
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  // Pobranie aktualnego kontekstu i przekształcenie go na format akceptowany przez komponenty
  const contextItems = Object.entries(context || {}).map(([key, value]) => [key, value]);

  // Obsługa powrotu do listy scenariuszy
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      navigate(`/${currentWorkspace.id}`);
    }
  };

  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    } else {
      handleGoToScenariosList();
    }
  };

  const handleNodeExecution = (value: any) => {
    if (!currentNode) return;
    
    console.log("Executing node with type:", currentNode.type, "value:", value);
    console.log("Current node context key:", currentNode.contextKey, "contextJsonPath:", currentNode.contextJsonPath);

    // Aktualizacja kontekstu w zależności od typu node'a
    if (
      currentNode.type === "input" &&
      currentNode.contextKey &&
      currentNode.contextJsonPath
    ) {
      // Dla node'ów typu input - aktualizujemy konkretną ścieżkę
      console.log(`Updating context path ${currentNode.contextKey}.${currentNode.contextJsonPath} with value:`, value);
      updateContextPath(
        currentNode.contextKey,
        currentNode.contextJsonPath,
        value
      );
    } else if (currentNode.type === "form" && currentNode.contextKey) {
      // Dla node'ów typu form - aktualizujemy wiele pól
      const keyData = { ...(context[currentNode.contextKey] || {}) };
      console.log("Form update - current keyData:", keyData);
      
      Object.entries(value).forEach(([fieldPath, fieldValue]) => {
        console.log(`Setting path ${fieldPath} to:`, fieldValue);
        setPath(keyData, fieldPath, fieldValue);
      });
      
      console.log("Updating context with new keyData:", keyData);
      updateContext(currentNode.contextKey, keyData);
    } else if (currentNode.contextKey) {
      // Dla innych typów node'ów, jeśli mają contextKey - aktualizujemy cały klucz
      console.log(`Updating entire context key ${currentNode.contextKey} with:`, value);
      updateContext(currentNode.contextKey, value);
    }

    // Przejście do następnego kroku lub zakończenie flow
    if (isLastNode) {
      console.log("Last node reached, going to scenarios list");
      handleGoToScenariosList();
    } else {
      console.log("Moving to next node");
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