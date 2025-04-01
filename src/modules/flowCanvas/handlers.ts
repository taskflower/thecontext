import { useCallback } from "react";
import { Connection, Node, NodeChange } from "reactflow";
import { TYPES, useAppStore } from "../store";
import { usePanelStore } from "../PanelStore";

/**
 * Hook zwracający handlery dla operacji ReactFlow
 */
export const useFlowHandlers = () => {
  // Pobieramy potrzebne metody ze store
  const addEdge = useAppStore((state) => state.addEdge);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const selectNode = useAppStore((state) => state.selectNode);

  // Pobieramy metody z PanelStore
  const setShowLeftPanel = usePanelStore((state) => state.setShowLeftPanel);
  const setLeftPanelTab = usePanelStore((state) => state.setLeftPanelTab);

  // Obsługa połączeń między węzłami
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge({
          source: params.source,
          target: params.target,
          type: TYPES.EDGE,
        });
      }
    },
    [addEdge]
  );

  // Obsługa przeciągania węzłów
  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  // Obsługa zmian węzłów, w tym zaznaczania
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      // Filtrujemy zmiany, aby znaleźć nowo zaznaczone węzły
      // Bezpieczne sprawdzenie typu zmiany
      const selectedNodes = [];

      for (const change of changes) {
        if (
          change.type === "select" &&
          "selected" in change &&
          change.selected === true &&
          "id" in change
        ) {
          selectedNodes.push(change.id);
        }
      }

      // Jeśli mamy nowo zaznaczony węzeł, aktualizujemy stan
      if (selectedNodes.length > 0) {
        const newSelectedNodeId = selectedNodes[0]; // Bierzemy pierwszy, jeśli jest wiele

        // Aktualizujemy zaznaczenie w store
        selectNode(newSelectedNodeId);

        // Aktualizujemy stan panelu
        setShowLeftPanel(true);
        setLeftPanelTab("nodes");
      }
    },
    [selectNode, setShowLeftPanel, setLeftPanelTab]
  );

  return {
    onConnect,
    onNodeDragStop,
    onNodesChange,
  };
};
