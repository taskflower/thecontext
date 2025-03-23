/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Connection,
  useNodesState,
  useEdgesState,
  Node,
  NodeTypes
} from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "../../store";
import { StepModal } from "./StepModal";
import CustomNode from "./CustomNode";
import "../styles.css";

// Define custom node types
const nodeTypes: NodeTypes = { custom: CustomNode };

const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(
    (state) => state.getActiveScenarioData
  );
  const addEdge = useAppStore((state) => state.addEdge);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selectNode = useAppStore((state) => state.selectNode);
  const stateVersion = useAppStore((state) => state.stateVersion);
  const calculateFlowPath = useAppStore((state) => state.calculateFlowPath);

  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();

  // Make sure each node has the "custom" type
  const preparedNodes = initialNodes.map((node: Node) => ({
    ...node,
    type: "custom",
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(preparedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<any[]>([]);

  // Update graph on data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    const updatedNodes = newNodes.map((node: Node) => ({
      ...node,
      type: "custom",
    }));
    setNodes(updatedNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, setNodes, setEdges, stateVersion]);

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

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Begin flow playback
  const handlePlay = useCallback(() => {
    const path = calculateFlowPath();
    if (path.length > 0) {
      setFlowPath(path);
      setCurrentNodeIndex(0);
      setIsPlaying(true);
    }
  }, [calculateFlowPath]);

  return (
    <div className="bg-card rounded-md shadow-sm p-0 h-full w-full relative">
      <div className="absolute top-2 right-2 z-10">
        <button
          onClick={handlePlay}
          className="p-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90"
        >
          Play Flow
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

      {isPlaying && flowPath.length > 0 && (
        <StepModal
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={() =>
            setCurrentNodeIndex((prev) =>
              Math.min(prev + 1, flowPath.length - 1)
            )
          }
          onPrev={() => setCurrentNodeIndex((prev) => Math.max(prev - 1, 0))}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default FlowGraph;