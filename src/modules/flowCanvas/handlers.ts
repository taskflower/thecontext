import React, { useCallback } from "react";
import { Node, Connection } from "reactflow";
import { useAppStore } from "../store";

/**
 * Hook zwracający handlery dla operacji ReactFlow
 */
export const useFlowHandlers = () => {
  // Pobieramy potrzebne metody ze store
  const addEdge = useAppStore((state) => state.addEdge);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const selectNode = useAppStore((state) => state.selectNode);

  // Obsługa połączeń między węzłami
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge({
          source: params.source,
          target: params.target,
          type: "step",
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

  // Obsługa kliknięcia na węzeł
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  return {
    onConnect,
    onNodeDragStop,
    onNodeClick
  };
};