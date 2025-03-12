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

const FlowEditor: React.FC<{ onEditNode?: (nodeId: string) => void }> = ({
  onEditNode,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [showNodeEditor, setShowNodeEditor] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const loadingRef = useRef(false);

  // Pobieranie danych scenariusza z magazynu
  const {
    getScenario,
    createEdge,
    addEdgeToScenario,

    getCurrentScenario,
    getValidEdges,
    validateScenarioEdges
  } = useScenarioStore();
  
  const { 

    updateNode, 
    setActiveNodeId, 
    getNodesByScenario 
  } = useNodeStore();
  
  const { 
    executeScenario, 
    getLatestExecution 
  } = useExecutionStore();

  // Pobieranie bieżącego scenariusza z magazynu
  const currentScenario = getCurrentScenario();
  const scenarioId = currentScenario?.id;
  const prevScenarioIdRef = useRef<string | null>(null);

  // Stworzenie zmemoizowanego obiektu nodeTypes, aby uniknąć ostrzeżeń React Flow
  const nodeTypes = React.useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  // Obsługa kliknięcia przycisku edycji węzła
  const handleEditNode = useCallback(
    (nodeId: string) => {
      setActiveNodeId(nodeId);
      if (onEditNode) {
        onEditNode(nodeId);
      } else {
        // Jeśli nie dostarczono zewnętrznej obsługi, pokazujemy wbudowany edytor
        setShowNodeEditor(true);
      }
    },
    [onEditNode, setActiveNodeId]
  );

  // Pobieranie najnowszych danych wykonania i odświeżanie węzłów
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
            response:
              execution.results[node.id]?.output || node.data.response || "",
          },
        }))
      );
    }
  }, [scenarioId, getLatestExecution, setNodes]);

  // Ładowanie węzłów i krawędzi przy zmianie scenariusza
  useEffect(() => {
    console.log("Loading scenario data, scenarioId:", scenarioId);
    if (!scenarioId) {
      console.warn("Cannot load flow data: No scenario ID provided");
      prevScenarioIdRef.current = null;
      setNodes([]);
      setEdges([]);
      setIsInitialized(false);
      return;
    }

    // Pomijamy przeładowanie dla tego samego scenariusza
    if (prevScenarioIdRef.current === scenarioId && isInitialized) {
      console.log(`Scenario ${scenarioId} already loaded, skipping reload`);
      return;
    }

    // Zapobiegamy równoległym operacjom ładowania
    if (loadingRef.current) {
      console.log("Loading already in progress, skipping");
      return;
    }

    loadingRef.current = true;

    // Resetowanie węzłów i krawędzi w stanie ReactFlow
    setNodes([]);
    setEdges([]);

    const scenario = getScenario(scenarioId);
    if (!scenario) {
      console.error(`Scenario ${scenarioId} not found`);
      loadingRef.current = false;
      return;
    }

    // Walidacja krawędzi scenariusza przed załadowaniem
    validateScenarioEdges(scenarioId);

    // Pobierz węzły bezpośrednio z nodeStore dla tego scenariusza
    const scenarioNodes = getNodesByScenario(scenarioId);
    
    console.log(
      `Found scenario with ${scenarioNodes.length} nodes and ${scenario.edgeIds.length} edges`
    );

    // Transformacja węzłów na format ReactFlow
    const flowNodes = scenarioNodes.map((node) => ({
      id: node.id,
      type: "custom",
      position: node.position,
      data: {
        ...node.data,
        label: node.data.label || node.type,
        response: node.data.response || "",
        onEditNode: handleEditNode,
      },
    }));

    // Pobierz tylko prawidłowe krawędzie dla tego scenariusza
    const validEdges = getValidEdges(scenarioId);
    
    // Transformacja krawędzi na format ReactFlow
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

    // Odświeżenie odpowiedzi z ostatniego wykonania
    refreshNodeResponses();

    // Aktualizacja referencji i stanu
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

  // Aktualizacja pozycji węzłów w magazynie po zakończeniu przeciągania
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      updateNode(node.id, {
        position: { x: node.position.x, y: node.position.y },
      });
    },
    [updateNode]
  );

  // Obsługa nowych połączeń między węzłami
  const onConnect = useCallback(
    (connection: Connection) => {
      // Tworzenie krawędzi w magazynie
      if (connection.source && connection.target) {
        const edgeId = createEdge(
          connection.source,
          connection.target,
          connection.sourceHandle as string | undefined,
          connection.targetHandle as string | undefined
        );

        // Dodanie do scenariusza
        if (scenarioId) {
          addEdgeToScenario(scenarioId, edgeId);
        }

        // Dodanie do przepływu
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

  // Obsługa kliknięcia węzła w celu otworzenia edytora
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setActiveNodeId(node.id);
      setShowNodeEditor(true);
    },
    [setActiveNodeId]
  );

  // Wyłączenie menu kontekstowego prawego przycisku myszy
  const onNodeContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
  }, []);

  // Wykonanie bieżącego scenariusza
  const runScenario = useCallback(() => {
    if (scenarioId) {
      executeScenario(scenarioId).then(() => {
        refreshNodeResponses();
      });
    }
  }, [scenarioId, executeScenario, refreshNodeResponses]);

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
          <button
            onClick={runScenario}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Run Scenario
          </button>
        </Panel>
        <Panel position="top-left">
          <NewNodeToolbar scenarioId={scenarioId} />
        </Panel>

        {/* Informacje debugowania */}
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

      {/* Dialog edytora węzłów (pokazywany po kliknięciu węzła lub przycisku edycji) */}
      {showNodeEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-2xl w-full">
            <NodeEditor onClose={() => setShowNodeEditor(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowEditor;