// src/components/nodes/FlowEditor.tsx
import React, { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  ConnectionLineType,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

import { useScenarioStore } from "../../stores/scenarioStore";
import { useNodeStore } from "../../stores/nodeStore";
import { useExecutionStore } from "../../stores/executionStore";
import CustomNode from "./CustomNode";
import NewNodeToolbar from "./NewNodeToolbar";
import NodeEditor from "./NodeEditor";
import { NavLink } from "react-router-dom";
import { Button } from "../ui";

const FlowEditor: React.FC<{ onEditNode?: (nodeId: string) => void }> = ({
  onEditNode,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0); // For forcing refresh
  const loadingRef = useRef(false);

  // Get scenario data from store
  const {
    getScenario,
    createEdge,
    addEdgeToScenario,
    getCurrentScenario,
    getValidEdges,
    validateScenarioEdges,
  } = useScenarioStore();

  const { updateNode, setActiveNodeId, getNodesByScenario } = useNodeStore();

  const { getLatestExecution } = useExecutionStore();

  // Get current scenario from store
  const currentScenario = getCurrentScenario();
  const scenarioId = currentScenario?.id;
  const prevScenarioIdRef = useRef<string | null>(null);

  // Function to force refresh
  const forceRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  // Create memoized nodeTypes object to avoid React Flow warnings
  const nodeTypes = React.useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // Handle node edit button click
  const handleEditNode = useCallback(
    (nodeId: string) => {
      setActiveNodeId(nodeId);
      if (onEditNode) {
        onEditNode(nodeId);
      } else {
        // If no external handler provided, show built-in editor
        setShowNodeEditor(true);
      }
    },
    [onEditNode, setActiveNodeId]
  );

  // Get latest execution data and refresh nodes
  const refreshNodeResponses = useCallback(() => {
    if (!scenarioId) {
      console.warn("Cannot refresh node responses: No scenario ID provided");
      return;
    }

    const execution = getLatestExecution(scenarioId);
    if (execution) {
      setNodes((nodes) =>
        nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            message:
              execution.results[node.id]?.output || node.data.message || "",
          },
        }))
      );
    }
  }, [scenarioId, getLatestExecution, setNodes]);

  // Load nodes and edges when scenario changes
  useEffect(() => {
    if (!scenarioId) {
      console.warn("Cannot load flow data: No scenario ID provided");
      prevScenarioIdRef.current = null;
      setNodes([]);
      setEdges([]);
      setIsInitialized(false);
      return;
    }

    // Skip reload for same scenario
    if (prevScenarioIdRef.current === scenarioId && isInitialized) {
      console.log(`Scenario ${scenarioId} already loaded, skipping reload`);
      return;
    }

    // Prevent parallel loading operations
    if (loadingRef.current) {
      console.log("Loading already in progress, skipping");
      return;
    }

    loadingRef.current = true;

    // Reset nodes and edges in ReactFlow state
    setNodes([]);
    setEdges([]);

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      loadingRef.current = false;
      return;
    }

    // Validate scenario edges before loading
    validateScenarioEdges(scenarioId);

    // Get nodes directly from nodeStore for this scenario
    const scenarioNodes = getNodesByScenario(scenarioId);

    // Transform nodes to ReactFlow format
    const flowNodes = scenarioNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        ...node.data,
        label: node.data.label || node.type,
        message: node.data.message || "",
        isStartNode: node.data.isStartNode || false,
        onEditNode: handleEditNode,
      },
    }));

    // Get only valid edges for this scenario
    const validEdges = getValidEdges(scenarioId);

    // Transform edges to ReactFlow format
    const flowEdges = validEdges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: "smoothstep",
      animated: true,
    }));

    setNodes(flowNodes);
    setEdges(flowEdges);

    // Refresh responses from latest execution
    refreshNodeResponses();

    // Update reference and state
    prevScenarioIdRef.current = scenarioId;
    setIsInitialized(true);
    loadingRef.current = false;
  }, [
    scenarioId,
    getScenario,
    getNodesByScenario,
    getValidEdges,
    validateScenarioEdges,
    refreshNodeResponses,
    setNodes,
    setEdges,
    handleEditNode,
    isInitialized,
  ]);

  // Effect to refresh node properties with added refreshToken
  useEffect(() => {
    if (!scenarioId || !isInitialized) return;

    // Get nodes directly from nodeStore for this scenario
    const scenarioNodes = getNodesByScenario(scenarioId);

    // Update node properties (including isStartNode) without changing position
    setNodes((nodes) =>
      nodes.map((node) => {
        const updatedNodeData = scenarioNodes.find((n) => n.id === node.id);
        if (updatedNodeData) {
          return {
            ...node,
            data: {
              ...node.data,
              ...updatedNodeData.data,
              label: updatedNodeData.data.label || updatedNodeData.type,
              isStartNode: updatedNodeData.data.isStartNode || false,
              onEditNode: handleEditNode,
            },
          };
        }
        return node;
      })
    );
  }, [
    scenarioId,
    getNodesByScenario,
    handleEditNode,
    isInitialized,
    setNodes,
    refreshToken,
  ]);

  // Update node positions in store after drag ends
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, {
        position: { x: node.position.x, y: node.position.y },
      });
    },
    [updateNode]
  );

  // Handle new connections between nodes
  const onConnect = useCallback(
    (connection: Connection) => {
      // Create edge in store
      if (connection.source && connection.target) {
        const edgeId = createEdge(
          connection.source,
          connection.target,
          connection.sourceHandle as string | undefined,
          connection.targetHandle as string | undefined
        );

        // Add to scenario
        if (scenarioId) {
          addEdgeToScenario(scenarioId, edgeId);
        }

        // Add to flow
        setEdges((eds) =>
          addEdge(
            {
              ...connection,
              type: "smoothstep",
              animated: true,
              id: edgeId,
            },
            eds
          )
        );
      }
    },
    [createEdge, addEdgeToScenario, scenarioId, setEdges]
  );

  // Handle node click to open editor
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setActiveNodeId(node.id);
      setShowNodeEditor(true);
    },
    [setActiveNodeId]
  );

  // Disable right-click context menu
  const onNodeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  if (!scenarioId) {
    return (
      <div className="p-4 text-center text-red-500">
        No active scenario found. Please select or create a scenario.
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onNodeContextMenu={onNodeContextMenu}
        maxZoom={1.25}
        minZoom={0.5}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
      >
        <Controls />
        <Background color="#aaa" gap={16} />
        <Panel position="top-right">
          <NavLink to={"/execute"}>
            <Button>Execute Scenario</Button>
          </NavLink>
        </Panel>
        <Panel position="top-left">
          <NewNodeToolbar scenarioId={scenarioId} />
        </Panel>

        {/* Debug info */}
        <Panel
          position="bottom-left"
          className="bg-white p-2 rounded shadow-md text-xs"
        >
          <div>Scenario ID: {scenarioId}</div>
          <div>
            Nodes: {nodes.length} | Edges: {edges.length}
          </div>
        </Panel>
      </ReactFlow>

      {showNodeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <NodeEditor
              onClose={() => {
                setShowNodeEditor(false);
                forceRefresh(); // Force refresh after editor closes
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;
