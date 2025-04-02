import React, { useCallback, useEffect, useMemo } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  NodeChange, 
} from "reactflow";
import "reactflow/dist/style.css";
import "./styles.css";
import { useAppStore } from "@/modules/store";
import { StepModal } from "@/modules/flow/components/StepModal";
import {
  useFlowHandlers,
  adaptNodeToReactFlow,
  adaptEdgeToReactFlow,
  nodeTypes,
  GRID_SIZE,
  DEFAULT_MAX_ZOOM,
} from "@/modules/flowCanvas";

import { Edit, PlayCircle, Puzzle, Sliders } from "lucide-react";

// Interfejs dla props
interface FlowGraphProps {
  onEditNode: () => void;
  onConfigurePlugin: () => void;
  onEditPluginOptions: () => void;
}

const FlowGraph: React.FC<FlowGraphProps> = ({
  onEditNode,
  onConfigurePlugin,
  onEditPluginOptions
}) => {
  const getActiveScenarioData = useAppStore(
    (state) => state.getActiveScenarioData
  );
  const stateVersion = useAppStore((state) => state.stateVersion);
  const startFlowSession = useAppStore((state) => state.startFlowSession);
  const stopFlowSession = useAppStore((state) => state.stopFlowSession);
  const resetFlowSession = useAppStore((state) => state.resetFlowSession);
  const isFlowPlaying = useAppStore(
    (state) => state.flowSession?.isPlaying || false
  );
  const selectedNodeId = useAppStore((state) => state.selected.node);

  // Get original flow handlers, including the new onNodesChange
  const {
    onConnect,
    onNodeDragStop,
    onNodesChange: handlersOnNodesChange,
  } = useFlowHandlers();

  const selectNode = useAppStore(state => state.selectNode);
  
  const onPaneClick = useCallback(() => {
    selectNode("");
  }, [selectNode]);

  const { nodes: originalNodes, edges: originalEdges } =
    getActiveScenarioData();
  const reactFlowNodes = originalNodes.map((node) =>
    adaptNodeToReactFlow(node, node.id === selectedNodeId)
  );
  const reactFlowEdges = originalEdges.map(adaptEdgeToReactFlow);
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      handlersOnNodesChange(changes);
      onNodesChange(changes);
    },
    [onNodesChange, handlersOnNodesChange]
  );

  // Pobierz sesję za pomocą hooka, a nie getState()
  const flowSession = useAppStore(state => state.flowSession);
  
  // Automatyczne uruchamianie sesji przy ładowaniu
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (
      flowSession &&
      !flowSession.isPlaying &&
      flowSession.temporarySteps &&
      flowSession.temporarySteps.length > 0
    ) {
      // Uruchom sesję automatycznie - używamy setTimeout, aby dać czas na inicjalizację innych komponentów
      timeoutId = setTimeout(() => {
        startFlowSession();
      }, 500);
    }
    
    // Czyszczenie timeoutu przy odmontowaniu komponentu
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [flowSession, startFlowSession]); 

  // Update graph on data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    const updatedNodes = newNodes.map((node) =>
      adaptNodeToReactFlow(node, node.id === selectedNodeId)
    );
    const updatedEdges = newEdges.map(adaptEdgeToReactFlow);

    setNodes(updatedNodes);
    setEdges(updatedEdges);
  }, [getActiveScenarioData, setNodes, setEdges, stateVersion, selectedNodeId]);

  // Start flow session
  const handlePlay = useCallback(() => {
    startFlowSession();
  }, [startFlowSession]);

  // Handle modal close
  const handleCloseModal = useCallback(() => {
    stopFlowSession(false);
  }, [stopFlowSession]);

  // Check if there's a previous, unfinished session
  const hasExistingSession = useAppStore(
    (state) =>
      !state.flowSession?.isPlaying &&
      state.flowSession?.temporarySteps &&
      state.flowSession.temporarySteps.length > 0
  );

  const currentSessionStep = useAppStore(
    (state) => state.flowSession?.currentStepIndex || 0
  );

  const handleNewSession = useCallback(() => {
    // If there's an unfinished session, reset it before starting a new one
    if (hasExistingSession) {
      resetFlowSession();
    }
    startFlowSession();
  }, [hasExistingSession, resetFlowSession, startFlowSession]);

  // Użycie hooków zamiast getState()
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  
  // Memoizacja obliczeń aby uniknąć niepotrzebnych re-renderów
  const selectedNode = useMemo(() => {
    const workspace = items.find((w) => w.id === selected.workspace);
    const scenario = workspace?.children.find(
      (s) => s.id === selected.scenario
    );
    return scenario?.children.find((n) => n.id === selectedNodeId);
  }, [items, selected, selectedNodeId]);

  const hasPlugin = selectedNode?.pluginKey !== undefined;

  return (
    <div className="bg-card rounded-md shadow-sm p-0 h-full w-full relative">
      {/* Right side buttons */}
      <div className="absolute top-2 left-2 z-10 flex space-x-2">
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
          className="flex gap-2 p-3 rounded-md bg-primary text-primary-foreground text-md font-medium hover:bg-primary/90"
          disabled={isFlowPlaying}
        >
         <PlayCircle/> {isFlowPlaying ? "Flow w trakcie..." : "Testuj sesja Flow"}
        </button>
      </div>

      {/* Left side plugin buttons */}
      {selectedNodeId && (
        <div className="absolute top-2 left-2 z-10 flex space-x-2">
          <button
            onClick={onEditNode}
            className="p-2 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/90 flex items-center gap-1"
            title="Edytuj zaznaczony węzeł"
          >
            <Edit className="h-4 w-4" />
            <span>Edytuj węzeł</span>
          </button>
          <button
            onClick={onConfigurePlugin}
            className="p-2 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/90 flex items-center gap-1"
            title="Konfiguruj plugin dla węzła"
          >
            <Puzzle className="h-4 w-4" />
            <span>{hasPlugin ? "Zmień plugin" : "Dodaj plugin"}</span>
          </button>

          {hasPlugin && (
            <button
              onClick={onEditPluginOptions}
              className="p-2 rounded-md bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/90 flex items-center gap-1"
              title="Konfiguruj opcje pluginu"
            >
              <Sliders className="h-4 w-4" />
              <span>Opcje pluginu</span>
            </button>
          )}
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={onPaneClick}
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