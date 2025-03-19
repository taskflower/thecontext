// src/modules/flowPlayer/utils/flowUtils.ts
import { FlowNode, FlowEdge } from '../types';

/**
 * Calculates the sequential path through a flow based on nodes and edges
 * 
 * @param nodes - Array of flow nodes
 * @param edges - Array of edges connecting the nodes
 * @returns Ordered array of nodes representing the flow path
 */
export const calculateFlowPath = (nodes: FlowNode[] = [], edges: FlowEdge[] = []): FlowNode[] => {
  if (nodes.length === 0) return [];
  
  // Find the start node (node without incoming edges)
  const targetNodes = new Set(edges.map(edge => edge.target));
  let startNodeId = nodes.find(node => !targetNodes.has(node.id))?.id;
  
  // If no explicit start node was found, use the first node
  if (!startNodeId && nodes.length > 0) {
    startNodeId = nodes[0].id;
  }
  
  if (!startNodeId) return [];
  
  // Create adjacency map for efficient traversal
  const adjacencyMap = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!adjacencyMap.has(edge.source)) {
      adjacencyMap.set(edge.source, []);
    }
    adjacencyMap.get(edge.source)?.push(edge.target);
  });
  
  // Traverse graph using depth-first search and collect path
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