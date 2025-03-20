/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  MiniMap, Controls, Background, Connection,
  useNodesState, useEdgesState, NodeDragHandler, NodeMouseHandler
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useAppStore } from './store';
import { StepModal } from './Components';
// import { TYPES } from './types';

// Flow Graph Component
const FlowGraph = () => {
  const items = useAppStore(state => state.items);
  const selected = useAppStore(state => state.selected);
  const getActiveScenarioData = useAppStore(state => state.getActiveScenarioData);
  const addEdge = useAppStore(state => state.addEdge);
  const updateNodePosition = useAppStore(state => state.updateNodePosition);
  const getCurrentScenario = useAppStore(state => state.getCurrentScenario);
  const selectNode = useAppStore(state => state.selectNode);
  // Force component to update when state changes
  const stateVersion = useAppStore(state => state.stateVersion);
  
  const { nodes: initialNodes, edges: initialEdges } = getActiveScenarioData();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<any[]>([]);
  
  // Update the graph when data changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = getActiveScenarioData();
    setNodes(newNodes);
    setEdges(newEdges);
  }, [getActiveScenarioData, selected.workspace, selected.scenario, selected.node, items, setNodes, setEdges, stateVersion]);
  
  const onConnect = useCallback((params: Connection) => {
    addEdge({
      source: params.source || '',
      target: params.target || '',
      type: 'step'
    });
  }, [addEdge]);
  
  const onNodeDragStop: NodeDragHandler = useCallback((_, node) => {
    updateNodePosition(node.id, node.position);
  }, [updateNodePosition]);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    selectNode(node.id);
  }, [selectNode]);
  
  // Find start node and calculate flow path
  const calculateFlowPath = useCallback(() => {
    const scenario = getCurrentScenario();
    if (!scenario) return [];
    
    const { children: scenarioNodes = [], edges: scenarioEdges = [] } = scenario;
    
    // Create node incoming edge count map
    const incomingMap = new Map<string, number>();
    scenarioEdges.forEach(edge => {
      incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
    });
    
    // Find start node (outgoing edges but no incoming)
    let startNodeId: string | null = null;
    for (const node of scenarioNodes) {
      const hasOutgoing = scenarioEdges.some(edge => edge.source === node.id);
      const incomingCount = incomingMap.get(node.id) || 0;
      
      if (hasOutgoing && incomingCount === 0) {
        startNodeId = node.id;
        break;
      }
    }
    
    // If no clear start, take first node
    if (!startNodeId && scenarioNodes.length > 0) {
      startNodeId = scenarioNodes[0].id;
    }
    
    if (!startNodeId) return [];
    
    // Create graph adjacency map
    const edgesMap = new Map<string, string[]>();
    scenarioEdges.forEach(edge => {
      if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
      edgesMap.get(edge.source)?.push(edge.target);
    });
    
    // Trace path with DFS
    const path: any[] = [];
    const visited = new Set<string>();
    
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      
      const nodeData = scenarioNodes.find(n => n.id === nodeId);
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
  
  // Flow player controls
  const handlePlay = useCallback(() => {
    const path = calculateFlowPath();
    if (path.length > 0) {
      setFlowPath(path);
      setCurrentNodeIndex(0);
      setIsPlaying(true);
    }
  }, [calculateFlowPath]);
  
  return (
    <div className="bg-white rounded-md shadow-sm p-0 h-[400px] relative">
      <div className="absolute top-2 right-2 z-10">
        <button 
          onClick={handlePlay}
          className="p-2 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
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
        fitView
      >
        <Controls />
        <MiniMap />
        <Background color="#aaa" gap={16} />
      </ReactFlow>
      
      {isPlaying && flowPath.length > 0 && (
        <StepModal 
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={() => setCurrentNodeIndex(prev => Math.min(prev + 1, flowPath.length - 1))}
          onPrev={() => setCurrentNodeIndex(prev => Math.max(prev - 1, 0))}
          onClose={() => setIsPlaying(false)}
        />
      )}
    </div>
  );
};

export default FlowGraph;