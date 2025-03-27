import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node
} from "reactflow";
import "reactflow/dist/style.css";

// Import styles
import "./styles.css";
import { useAppStore } from "@/modules/store";
import { StepModal } from "@/modules/flow/components/StepModal";
import { useFlowHandlers, adaptNodeToReactFlow, adaptEdgeToReactFlow, nodeTypes, GRID_SIZE, DEFAULT_MAX_ZOOM } from "@/modules/flowCanvas";
import { usePanelStore } from "@/modules/PanelStore";

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

  // Get panel store actions
  const setLeftPanelTab = usePanelStore((state) => state.setLeftPanelTab);
  const setShowLeftPanel = usePanelStore((state) => state.setShowLeftPanel);

  // Get original flow handlers
  const { onConnect, onNodeDragStop, onNodeClick: originalOnNodeClick } = useFlowHandlers();

  // Enhanced node click handler that also manages panel state
  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      // First call original handler
      originalOnNodeClick(event, node);
      
      // Then set panel state
      setShowLeftPanel(true);
      setLeftPanelTab("nodes");
    },
    [originalOnNodeClick, setShowLeftPanel, setLeftPanelTab]
  );

  // Get data and transform for ReactFlow
  const { nodes: originalNodes, edges: originalEdges } =
    getActiveScenarioData();
  const reactFlowNodes = originalNodes.map((node) =>
    adaptNodeToReactFlow(node, node.id === selectedNodeId)
  );
  const reactFlowEdges = originalEdges.map(adaptEdgeToReactFlow);

  // Initialize ReactFlow state
  const [nodes, setNodes, onNodesChange] = useNodesState(reactFlowNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(reactFlowEdges);

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
    // Calling without argument will keep the temporary session for later continuation
    stopFlowSession(false);
  }, [stopFlowSession]);

  // Check if there's a previous, unfinished session
  const hasExistingSession = useAppStore(
    (state) => !state.flowSession?.isPlaying && state.flowSession?.temporarySteps && state.flowSession.temporarySteps.length > 0
  );

  // Current step index in the temporary session
  const currentSessionStep = useAppStore(
    (state) => state.flowSession?.currentStepIndex || 0
  );

  // Handle starting a new session
  const handleNewSession = useCallback(() => {
    // If there's an unfinished session, clear it before starting a new one
    if (hasExistingSession) {
      const appStore = useAppStore.getState();
      if (appStore.flowSession) {
        // Create a new object with empty steps
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