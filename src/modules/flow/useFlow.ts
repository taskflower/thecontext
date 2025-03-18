// src/modules/flow/useFlow.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppStore } from '../store';


export const useFlow = () => {
  // Referencje do aktualnego stanu z AppStore, aby uniknąć zbyt częstego odświeżania
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const selectNode = useAppStore(state => state.selectNode);
  const selectEdge = useAppStore(state => state.selectEdge);
  const clearSelection = useAppStore(state => state.clearSelection);
  const selected = useAppStore(state => state.selected);
  const stateVersion = useAppStore(state => state.stateVersion);

  // Wewnętrzny stan do przechowywania ostatnich poprawnych danych
  const [flowData, setFlowData] = useState(() => {
    const data = getActiveScenarioData();
    return {
      nodes: data?.nodes || [],
      edges: data?.edges || []
    };
  });

  // Ref do śledzenia, czy komponent jest zamontowany
  const isMounted = useRef(true);

  // Aktualizacja flowData tylko gdy dane się zmieniły i komponent jest zamontowany
  useEffect(() => {
    const data = getActiveScenarioData();
    const newNodes = data?.nodes || [];
    const newEdges = data?.edges || [];
    
    // Aktualizuj tylko jeśli dane się zmieniły
    if (
      newNodes.length !== flowData.nodes.length || 
      newEdges.length !== flowData.edges.length ||
      JSON.stringify(newNodes) !== JSON.stringify(flowData.nodes) ||
      JSON.stringify(newEdges) !== JSON.stringify(flowData.edges)
    ) {
      setFlowData({
        nodes: newNodes,
        edges: newEdges
      });
    }
  }, [getActiveScenarioData, stateVersion]);

  // Ustawienie flagi odmontowania przy niszczeniu komponentu
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Utwórz krawędź
  const handleConnect = useCallback((source: string, target: string) => {
    addEdge({ source, target });
  }, [addEdge]);

  // Zaktualizuj pozycję węzła
  const handleNodePositionChange = useCallback((nodeId: string, position: { x: number, y: number }) => {
    updateNodePosition(nodeId, position);
  }, [updateNodePosition]);

  // Obsługa zaznaczenia
  const handleSelectionChange = useCallback((params: { nodes?: { id: string }[], edges?: { id: string }[] }) => {
    // Upewnij się, że nodes i edges istnieją przed próbą odczytu length
    const selectedNodes = params?.nodes || [];
    const selectedEdges = params?.edges || [];
    
    if (selectedNodes.length > 0) {
      selectNode(selectedNodes[0].id);
    } else if (selectedEdges.length > 0) {
      selectEdge(selectedEdges[0].id);
    } else {
      clearSelection();
    }
  }, [selectNode, selectEdge, clearSelection]);

  return {
    flowData,
    selected,
    onConnect: handleConnect,
    onNodePositionChange: handleNodePositionChange,
    onSelectionChange: handleSelectionChange,
    onPaneClick: clearSelection
  };
};