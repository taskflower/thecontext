/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  NodeMouseHandler,
  EdgeMouseHandler,
  NodeDragHandler,
} from "reactflow";
import "reactflow/dist/style.css";
// Import custom flow styles (create this file in your project)
import "./flowStyle.css";
import { useAppStore } from "../store";
import { FlowPlayer } from "./FlowPlayer";

export const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const selectNode = useAppStore(state => state.selectNode);
  const selectEdge = useAppStore(state => state.selectEdge);
  const clearSelection = useAppStore(state => state.clearSelection);
  const selected = useAppStore(state => state.selected);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  // Update the graph when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, setNodes, setEdges, stateVersion, selected]);
  
  const onConnect = useCallback(
    (params: Connection) => {
      if (params.source && params.target) {
        addEdge({
          source: params.source,
          target: params.target,
        });
      }
    },
    [addEdge]
  );
  
  const onNodeDragStop = useCallback<NodeDragHandler>(
    (event, node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );
  
  // Używamy onNodeClick aby zachować spójność z onMouseDown w ItemList
  const onNodeClick = useCallback<NodeMouseHandler>(
    (event, node) => {
      // Natychmiast zaznaczamy node - nie czekamy na onMouseUp
      selectNode(node.id);
      event.stopPropagation();
    },
    [selectNode]
  );
  
  // Używamy onEdgeClick aby zachować spójność z onMouseDown w ItemList
  const onEdgeClick = useCallback<EdgeMouseHandler>(
    (event, edge) => {
      // Natychmiast zaznaczamy edge - nie czekamy na onMouseUp
      selectEdge(edge.id);
      event.stopPropagation();
    },
    [selectEdge]
  );
  
  const onPaneClick = useCallback(
    (event:any) => {
      // Sprawdzamy czy to faktycznie kliknięcie w tło, a nie w node/edge
      if (event.target === event.currentTarget) {
        clearSelection();
      }
    },
    [clearSelection]
  );
  
  return (
    <div className="bg-card rounded-md p-0 h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        fitView
        className="flow-container"
      >
        <Controls />
        <MiniMap />
        <Background gap={16} size={1} className="flow-background" />
      </ReactFlow>
      
      <FlowPlayer />
    </div>
  );
};