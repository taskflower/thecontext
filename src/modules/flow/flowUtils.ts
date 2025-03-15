import { GraphEdge, GraphNode } from "../types";

export const calculateFlowPath = (nodes: GraphNode[] = [], edges: GraphEdge[] = []): GraphNode[] => {
  if (nodes.length === 0) return [];
  
  // Create map of incoming edges
  const incomingMap = new Map();
  edges.forEach((edge) => {
    incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
  });
  
  // Find starting node (outgoing edges but no incoming)
  let startNodeId = null;
  for (const node of nodes) {
    const hasOutgoing = edges.some((edge) => edge.source === node.id);
    const incomingCount = incomingMap.get(node.id) || 0;
    
    if (hasOutgoing && incomingCount === 0) {
      startNodeId = node.id;
      break;
    }
  }
  
  // If no clear start, take first node
  if (!startNodeId && nodes.length > 0) {
    startNodeId = nodes[0].id;
  }
  
  if (!startNodeId) return [];
  
  // Create graph adjacency map
  const edgesMap = new Map();
  edges.forEach((edge) => {
    if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
    edgesMap.get(edge.source).push(edge.target);
  });
  
  // Track path using DFS
  const path: GraphNode[] = [];
  const visited = new Set();
  
  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    
    const nodeData = nodes.find((n) => n.id === nodeId);
    if (nodeData) {
      path.push(nodeData);
      visited.add(nodeId);
      
      const nextNodes = edgesMap.get(nodeId) || [];
      for (const next of nextNodes) dfs(next);
    }
  };
  
  dfs(startNodeId);
  return path;
};