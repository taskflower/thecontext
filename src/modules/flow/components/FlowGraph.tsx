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
} from "reactflow";
import "reactflow/dist/style.css";
import { useAppStore } from "../../store";
import { StepModal } from "./StepModal";
import CustomNode from "./CustomNode"; // Importujemy komponent z pliku CustomNode.tsx
import "../styles.css";

// Ustawienie custom node o typie "custom"
const nodeTypes = { custom: CustomNode };

const FlowGraph: React.FC = () => {
  const getActiveScenarioData = useAppStore(
    (state) => state.getActiveScenarioData
  );
  const addEdge = useAppStore((state) => state.addEdge);
  const updateNodePosition = useAppStore((state) => state.updateNodePosition);
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const selectNode = useAppStore((state) => state.selectNode);
  const stateVersion = useAppStore((state) => state.stateVersion);

  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();

  // Upewniamy się, że każdy węzeł ma ustawiony typ "custom"
  const preparedNodes = initialNodes.map((node: Node) => ({
    ...node,
    type: "custom",
  }));

  const [nodes, setNodes, onNodesChange] = useNodesState(preparedNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<any[]>([]);

  // Aktualizacja grafu przy zmianach danych
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
    (_: any, node: Node) => {
      updateNodePosition(node.id, node.position);
    },
    [updateNodePosition]
  );

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Obliczanie ścieżki przepływu do odtwarzania krok po kroku
  const calculateFlowPath = useCallback(() => {
    const scenario = getCurrentScenario();
    if (!scenario) return [];

    const { children: scenarioNodes = [], edges: scenarioEdges = [] } =
      scenario;

    // Mapa zliczająca przychodzące krawędzie dla każdego węzła
    const incomingMap = new Map<string, number>();
    scenarioEdges.forEach((edge) => {
      incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
    });

    // Znajdź węzeł startowy (ma krawędzie wychodzące, ale brak przychodzących)
    let startNodeId: string | null = null;
    for (const node of scenarioNodes) {
      const hasOutgoing = scenarioEdges.some((edge) => edge.source === node.id);
      const incomingCount = incomingMap.get(node.id) || 0;

      if (hasOutgoing && incomingCount === 0) {
        startNodeId = node.id;
        break;
      }
    }

    // Jeśli nie znaleziono, wybierz pierwszy
    if (!startNodeId && scenarioNodes.length > 0) {
      startNodeId = scenarioNodes[0].id;
    }

    if (!startNodeId) return [];

    // Utwórz mapę grafu (sąsiedztwa)
    const edgesMap = new Map<string, string[]>();
    scenarioEdges.forEach((edge) => {
      if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
      edgesMap.get(edge.source)?.push(edge.target);
    });

    // Prześledź ścieżkę metodą DFS
    const path: any[] = [];
    const visited = new Set<string>();

    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;

      const nodeData = scenarioNodes.find((n) => n.id === nodeId);
      if (nodeData) {
        path.push(nodeData);
        visited.add(nodeId);

        const nextNodes = edgesMap.get(nodeId) || [];
        for (const next of nextNodes) dfs(next);
      }
    };

    dfs(startNodeId);
    return path;
  }, [getCurrentScenario]);

  // Rozpoczęcie odtwarzania przepływu
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
        defaultEdgeOptions={{ type: "step" }} // Dodane: ustawienie krawędzi na kwadratowe
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
