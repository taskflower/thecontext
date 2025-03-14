/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/nodes/FlowEditor.tsx
import React, { useCallback, useEffect, useState } from "react";
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

const FlowEditor: React.FC<{ onEditNode?: (nodeId: string) => void }> = () => {
  // Stan ReactFlow dla węzłów i krawędzi
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [, setRefreshToken] = useState(0);


  // Pobieramy wszystkie węzły ze store
  const allNodesFromStore = useNodeStore((state) => state.nodes);
  const { updateNode, setActiveNodeId } = useNodeStore();

  // Pobieramy scenariusze oraz krawędzie ze store scenariuszy
  const { scenarios, getCurrentScenario, createEdge, addEdgeToScenario, getValidEdges, edges: storeEdges } = useScenarioStore();
  let currentScenario = getCurrentScenario();
  if (!currentScenario) {
    const scenarioArray = Object.values(scenarios);
    if (scenarioArray.length > 0) {
      currentScenario = scenarioArray[0];
    }
  }
  const scenarioId = currentScenario?.id;

  const { getLatestExecution } = useExecutionStore();

  const forceRefresh = useCallback(() => {
    setRefreshToken((prev) => prev + 1);
  }, []);

  const nodeTypes = React.useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // Otwieramy edytor po kliknięciu w węzeł
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setActiveNodeId(node.id);
      setShowNodeEditor(true);
    },
    [setActiveNodeId]
  );

  // Aktualizacja pozycji węzła po przeciągnięciu
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, { position: { x: node.position.x, y: node.position.y } });
    },
    [updateNode]
  );

  // Tworzenie krawędzi – po kliknięciu "connect"
  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        const edgeId = createEdge(
          connection.source,
          connection.target,
          connection.sourceHandle as string | undefined,
          connection.targetHandle as string | undefined
        );
        if (scenarioId) {
          addEdgeToScenario(scenarioId, edgeId);
        }
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

  // Subskrybujemy zmiany węzłów – gdy zmienia się store, aktualizujemy stan ReactFlow
  useEffect(() => {
    if (!scenarioId) return;
    const scenarioNodes = Object.values(allNodesFromStore).filter(
      (node) => node.scenarioId === scenarioId
    );
    const flowNodes = scenarioNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        ...node.data,
        label: node.data.label || node.type,
        message: node.data.message || "",
        isStartNode: node.data.isStartNode || false,
        onEditNode: (id: string) => {
          setActiveNodeId(id);
          setShowNodeEditor(true);
        },
      },
    }));
    setNodes(flowNodes);
  }, [allNodesFromStore, scenarioId, setNodes, setActiveNodeId]);

  // Subskrybujemy zmiany krawędzi ze scenarioStore – gdy się zmieniają, aktualizujemy lokalny stan
  useEffect(() => {
    if (!scenarioId) return;
    const validEdges = getValidEdges(scenarioId);
    const flowEdges = validEdges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      label: edge.label,
      type: "smoothstep",
      animated: true,
    }));
    setEdges(flowEdges);
  }, [scenarioId, storeEdges, getValidEdges]);

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
        onNodeClick={onNodeClick}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        fitView
        maxZoom={1.25}
        snapToGrid={true}
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
                forceRefresh();
              }}
              scenarioId={scenarioId}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;
