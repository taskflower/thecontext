import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import "reactflow/dist/style.css";


// Importujemy z nowego modułu flowCanvas


// Importujemy style
import "./styles.css";
import { useAppStore } from "@/modules/store";
import { StepModal } from "@/modules/flow/components/StepModal";
import { useFlowHandlers, adaptNodeToReactFlow, adaptEdgeToReactFlow, nodeTypes, GRID_SIZE, DEFAULT_MAX_ZOOM } from "@/modules/flowCanvas";

const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(
    (state) => state.getActiveScenarioData
  );
  const stateVersion = useAppStore((state) => state.stateVersion);
  const startFlowSession = useAppStore((state) => state.startFlowSession);
  const stopFlowSession = useAppStore((state) => state.stopFlowSession);
  const isFlowPlaying = useAppStore(
    (state) => state.flowSession?.isPlaying || false
  );
  const selectedNodeId = useAppStore((state) => state.selected.node);

  // Używamy handlera z nowego modułu
  const { onConnect, onNodeDragStop, onNodeClick } = useFlowHandlers();

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
        maxZoom={DEFAULT_MAX_ZOOM}
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