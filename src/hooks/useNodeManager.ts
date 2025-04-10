// src/hooks/useNodeManager.ts (poprawiona wersja)
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

  // Ustawienie aktywnego workspace'a w contextStore, gdy się zmieni
  useEffect(() => {
    if (currentWorkspace?.id) {
      console.log("[useNodeManager] Ustawianie aktywnego workspace:", currentWorkspace.id);
      setActiveWorkspace(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, setActiveWorkspace]);

  // Resetowanie indeksu node'a, gdy zmieni się scenariusz
  useEffect(() => {
    console.log("[useNodeManager] Zmiana scenariusza, resetowanie indeksu node'a");
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);

  // Pobranie aktualnego kontekstu i przekształcenie go na format akceptowany przez komponenty
  const contextItems = Object.entries(context || {}).map(([key, value]) => [key, value]);

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
    
    console.log("[useNodeManager] Wykonywanie node'a typu:", currentNode.type, "wartość:", value);
    console.log("[useNodeManager] Dane node'a:", {
      contextKey: currentNode.contextKey,
      contextJsonPath: currentNode.contextJsonPath
    });

    // Aktualizacja kontekstu w zależności od typu node'a
    if (
      (currentNode.type === "input" || !currentNode.type) &&
      currentNode.contextKey &&
      currentNode.contextJsonPath
    ) {
      // Dla node'ów typu input - aktualizujemy konkretną ścieżkę
      console.log(`[useNodeManager] Aktualizacja ścieżki kontekstu ${currentNode.contextKey}.${currentNode.contextJsonPath}`);
      updateContextPath(
        currentNode.contextKey,
        currentNode.contextJsonPath,
        value
      );
    } else if (currentNode.type === "form" && currentNode.contextKey) {
      // Dla node'ów typu form - aktualizujemy wiele pól
      console.log("[useNodeManager] Aktualizacja pól formularza dla klucza:", currentNode.contextKey);
      
      // W przypadku formularza wartość powinna być obiektem z polami
      if (typeof value === 'object') {
        const formData = { ...(context[currentNode.contextKey] || {}) };
        
        // Aktualizuj poszczególne pola formularza
        Object.entries(value).forEach(([fieldPath, fieldValue]) => {
          // Helper function to set value at a nested path
          const setPath = (obj: any, path: string, val: any) => {
            const keys = path.split('.');
            let current = obj;
            
            // Navigate through all keys except the last one
            for (let i = 0; i < keys.length - 1; i++) {
              const key = keys[i];
              if (typeof current[key] !== 'object' || current[key] === null) {
                current[key] = {};
              }
              current = current[key];
            }
            
            // Set the value at the last key
            const lastKey = keys[keys.length - 1];
            current[lastKey] = val;
          };
          
          console.log(`[useNodeManager] Ustawianie pola formularza ${fieldPath}:`, fieldValue);
          setPath(formData, fieldPath, fieldValue);
        });
        
        // Aktualizuj cały klucz kontekstu z zaktualizowanymi danymi formularza
        console.log("[useNodeManager] Aktualizacja całego klucza kontekstu:", currentNode.contextKey);
        updateContext(currentNode.contextKey, formData);
      } else {
        console.warn("[useNodeManager] Nieoczekiwany format danych formularza:", value);
      }
    } else if (currentNode.contextKey) {
      // Dla innych typów node'ów, jeśli mają contextKey - aktualizujemy cały klucz
      console.log("[useNodeManager] Aktualizacja klucza kontekstu:", currentNode.contextKey);
      updateContext(currentNode.contextKey, value);
    }

    // Przejście do następnego kroku lub zakończenie flow
    if (isLastNode) {
      console.log("[useNodeManager] Ostatni node osiągnięty, przejście do listy scenariuszy");
      handleGoToScenariosList();
    } else {
      console.log("[useNodeManager] Przejście do następnego node'a");
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };

  // Debug info
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