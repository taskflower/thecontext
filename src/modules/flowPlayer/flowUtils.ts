// src/modules/flowPlayer/flowUtils.ts
import { FlowNode, FlowEdge } from '../flow/types';

export const calculateFlowPath = (nodes: FlowNode[] = [], edges: FlowEdge[] = []): FlowNode[] => {
  if (nodes.length === 0) return [];
  
  // Find the start node (without incoming edges)
  const targetNodes = new Set(edges.map(edge => edge.target));
  let startNodeId = nodes.find(node => !targetNodes.has(node.id))?.id;
  
  // If no explicit start node was found, use the first node
  if (!startNodeId && nodes.length > 0) {
    startNodeId = nodes[0].id;
  }
  
  if (!startNodeId) return [];
  
  // Create adjacency map for edges
  const adjacencyMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!adjacencyMap.has(edge.source)) {
      adjacencyMap.set(edge.source, []);
    }
    adjacencyMap.get(edge.source)?.push(edge.target);
  });
  
  // Traverse graph and collect path
  const path: FlowNode[] = [];
  const visited = new Set<string>();
  
  const dfs = (nodeId: string) => {
    if (visited.has(nodeId)) return;
    
    const node = nodes.find(n => n.id === nodeId);
    if (node) {
      visited.add(nodeId);
      path.push(node);
      
      const neighbors = adjacencyMap.get(nodeId) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor);
      }
    }
  };
  
  dfs(startNodeId);
  return path;
};