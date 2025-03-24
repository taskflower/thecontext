/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Connection,
  useNodesState,
  useEdgesState,
  Node,
  NodeTypes,
  Edge as ReactFlowEdge
} from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "../../store";
import { StepModal } from "./StepModal";
import CustomNode from "./CustomNode";
import "../styles.css";
import { FlowNode, Edge } from "../../graph/types";

// Adapter do konwersji FlowNode na format ReactFlow
const adaptNodeToReactFlow = (node: FlowNode, isSelected: boolean): Node => ({
  id: node.id,
  type: "custom",
  data: {
    label: node.label,
    nodeId: node.id,
    prompt: node.userPrompt,
    message: node.assistantMessage,
    pluginKey: node.pluginKey
  },
  position: node.position,
  selected: isSelected
});

// Adapter do konwersji Edge na format ReactFlow
const adaptEdgeToReactFlow = (edge: Edge): ReactFlowEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  label: edge.label,
  type: "step"
});

// Definiowanie typów węzłów
const nodeTypes: NodeTypes = { custom: CustomNode };

const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const selectNode = useAppStore(state => state.selectNode);
  const stateVersion = useAppStore(state => state.stateVersion);
  const startFlowSession = useAppStore(state => state.startFlowSession);
  const stopFlowSession = useAppStore(state => state.stopFlowSession);
  const isFlowPlaying = useAppStore(state => state.flowSession?.isPlaying || false);
  const selectedNodeId = useAppStore(state => state.selected.node);

  // Pobierz dane i przekształć je dla ReactFlow
  const { nodes: originalNodes, edges: originalEdges } = getActiveScenarioData();
  const reactFlowNodes = originalNodes.map(node => 
    adaptNodeToReactFlow(node, node.id === selectedNodeId)
  );
  const reactFlowEdges = originalEdges.map(adaptEdgeToReactFlow);

  // Inicjalizacja stanu ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Aktualizacja grafu na zmiany danych
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    const updatedNodes = newNodes.map(node => 
      adaptNodeToReactFlow(node, node.id === selectedNodeId)
    );
    const updatedEdges = newEdges.map(adaptEdgeToReactFlow);
    
    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [getActiveScenarioData, setNodes, setEdges, stateVersion, selectedNodeId]);

  // Obsługa połączeń
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

  // Rozpoczęcie sesji flow
  const handlePlay = useCallback(() => {
    startFlowSession();
  }, [startFlowSession]);

  // Obsługa zamknięcia okna modal
  const handleCloseModal = useCallback(() => {
    stopFlowSession(false);
  }, [stopFlowSession]);

  return (
    <div className="bg-card rounded-md shadow-sm p-0 h-full w-full relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handlePlay}
          className="p-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
          disabled={isFlowPlaying}
        >
          {isFlowPlaying ? "Flow w trakcie..." : "Uruchom Flow"}
        </button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ type: "step" }}
        fitView
        maxZoom={1.25}
      >
        <Controls />
        <MiniMap />
        <Background color="hsl(var(--muted))" gap={16} />
      </ReactFlow>

      {isFlowPlaying && (
        <StepModal onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default FlowGraph;