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
  Edge as ReactFlowEdge,
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
    pluginKey: node.pluginKey,
  },
  position: node.position,
  selected: isSelected,
});

// Adapter do konwersji Edge na format ReactFlow
const adaptEdgeToReactFlow = (edge: Edge): ReactFlowEdge => ({
  id: edge.id,
  source: edge.source,
  target: edge.target,
  label: edge.label,
  type: "step",
  style: {
    strokeDasharray: 5,
    strokeWidth: 2,
    animation: "dashMove 5s linear infinite",
  },
});

const nodeTypes: NodeTypes = { custom: CustomNode };
const GRID_SIZE = 20;

const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(
    (state) => state.getActiveScenarioData
  );
  const addEdge = useAppStore((state) => state.addEdge);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const selectNode = useAppStore((state) => state.selectNode);
  const stateVersion = useAppStore((state) => state.stateVersion);
  const startFlowSession = useAppStore((state) => state.startFlowSession);
  const stopFlowSession = useAppStore((state) => state.stopFlowSession);
  const isFlowPlaying = useAppStore(
    (state) => state.flowSession?.isPlaying || false
  );
  const selectedNodeId = useAppStore((state) => state.selected.node);

  // Pobierz dane i przekształć je dla ReactFlow
  const { nodes: originalNodes, edges: originalEdges } =
    getActiveScenarioData();
  const reactFlowNodes = originalNodes.map((node) =>
    adaptNodeToReactFlow(node, node.id === selectedNodeId)
  );
  const reactFlowEdges = originalEdges.map(adaptEdgeToReactFlow);

  // Inicjalizacja stanu ReactFlow
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  // Aktualizacja grafu na zmiany danych
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    const updatedNodes = newNodes.map((node) =>
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
    // Wywołanie bez argumentu zachowa tymczasową sesję do późniejszej kontynuacji
    stopFlowSession(false);
  }, [stopFlowSession]);

  // Sprawdź, czy istnieje wcześniejsza, niezakończona sesja
  const hasExistingSession = useAppStore(
    (state) => !state.flowSession?.isPlaying && state.flowSession?.temporarySteps && state.flowSession.temporarySteps.length > 0
  );

  // Aktualny indeks kroku w tymczasowej sesji
  const currentSessionStep = useAppStore(
    (state) => state.flowSession?.currentStepIndex || 0
  );

  // Obsługa rozpoczęcia nowej sesji
  const handleNewSession = useCallback(() => {
    // Jeśli istnieje niezakończona sesja, wyczyść ją przed rozpoczęciem nowej
    if (hasExistingSession) {
      // Zamiast używać set, użyjemy bezpośrednio stanu z useAppStore
      const appStore = useAppStore.getState();
      if (appStore.flowSession) {
        // Tworzymy nowy obiekt z pustymi krokami
        appStore.flowSession = {
          ...appStore.flowSession,
          temporarySteps: [],
          currentStepIndex: 0
        };
      }
    }
    startFlowSession();
  }, [hasExistingSession, startFlowSession]);
  return (
    <div className="bg-card rounded-md shadow-sm p-0 h-full w-full relative">
      <style>
        {`
          @keyframes dashMove {
            to {
              stroke-dashoffset: -20;
            }
          }
        `}
      </style>
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
  {hasExistingSession && (
    <button
      onClick={handlePlay}
      className="p-2 rounded-md bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/90"
    >
      Kontynuuj sesję (krok {currentSessionStep + 1})
    </button>
  )}
  <button
    onClick={handleNewSession}
    className="p-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
    disabled={isFlowPlaying}
  >
    {isFlowPlaying ? "Flow w trakcie..." : "Nowa sesja Flow"}
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
        snapToGrid={true}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        fitView
        maxZoom={1.25}
      >
        <Controls />
        <MiniMap />
        <Background gap={GRID_SIZE} size={1} color="#888" />
      </ReactFlow>

      {isFlowPlaying && <StepModal onClose={handleCloseModal} />}
    </div>
  );
};

export default FlowGraph;