// src/hooks/useNodeManager.ts
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { useContextStore } from '../lib/contextStore';
z


export function useNodeManager() {
  const navigate = useNavigate();
  const { getCurrentWorkspace, getCurrentScenario } = useAppStore();
  const { updateContext, updateContextPath } = useContextStore();
  
  // Stan lokalny dla aktualnego indeksu węzła
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  
  // Pobieramy bieżący scenariusz i workspace
  const currentWorkspace = getCurrentWorkspace();
  const currentScenario = getCurrentScenario();
  
  // Pobieramy węzły scenariusza
  const nodes = currentScenario?.nodes || [];
  
  // Aktualny węzeł na podstawie indeksu
  const currentNode = nodes[currentNodeIndex];
  
  // Sprawdzamy czy to ostatni węzeł
  const isLastNode = currentNodeIndex === nodes.length - 1;
  
  // Efekt do resetowania indeksu przy zmianie scenariusza
  useEffect(() => {
    setCurrentNodeIndex(0);
  }, [currentScenario?.id]);
  
  // Kontekst aplikacji jako pary klucz-wartość (dla widoków)
  const context = useContextStore(state => state.context);
  const contextItems = Object.entries(context);
  
  // Obsługa powrotu do listy scenariuszy
  const handleGoToScenariosList = () => {
    if (currentWorkspace) {
      navigate(`/${currentWorkspace.id}`);
    }
  };
  
  // Obsługa przejścia do poprzedniego węzła
  const handlePreviousNode = () => {
    if (currentNodeIndex > 0) {
      setCurrentNodeIndex(currentNodeIndex - 1);
    }
  };
  
  // Obsługa wykonania węzła (przesłania danych i przejścia dalej)
  const handleNodeExecution = (value: any) => {
    if (!currentNode) return;
    
    // Aktualizujemy kontekst na podstawie typu węzła
    if (currentNode.type === 'input' && currentNode.contextKey && currentNode.contextJsonPath) {
      // Dla węzłów wejściowych - aktualizujemy pojedynczą wartość
      updateContextPath(currentNode.contextKey, currentNode.contextJsonPath, value);
    } else if (currentNode.type === 'form' && currentNode.contextKey) {
      // Dla węzłów formularza - aktualizujemy wiele wartości
      const keyData = { ...context[currentNode.contextKey] };
      
      // Aktualizujemy każdą wartość z formularza
      Object.entries(value).forEach(([fieldPath, fieldValue]) => {
        setPath(keyData, fieldPath, fieldValue);
      });
      
      // Aktualizujemy cały obiekt kontekstu
      updateContext(currentNode.contextKey, keyData);
    }
    
    // Jeśli to ostatni węzeł, wracamy do listy scenariuszy
    if (isLastNode) {
      handleGoToScenariosList();
    } else {
      // W przeciwnym razie przechodzimy do następnego węzła
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

function setPath(keyData: any, fieldPath: string, fieldValue: unknown) {
    throw new Error('Function not implemented.');
}
