// src/utils/graphUtils.ts

import { Edge, Node } from "@/types/common";

/**
 * Builds a directed graph representation from nodes and edges
 */
export function buildGraph(nodes: Node[], edges: Edge[]) {
  const graph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};

  // Initialize graph
  nodes.forEach((node) => {
    graph[node.id] = [];
    inDegree[node.id] = 0;
  });

  // Add edges
  edges.forEach((edge) => {
    if (graph[edge.source]) {
      graph[edge.source].push(edge.target);
      inDegree[edge.target]++;
    }
  });

  return { graph, inDegree };
}

/**
 * Returns all nodes reachable from a start node using BFS
 */
export function getReachableNodes(
  startNodeId: string,
  graph: Record<string, string[]>
): Set<string> {
  const visited = new Set([startNodeId]);
  const queue = [startNodeId];

  while (queue.length > 0) {
    const currentId = queue.shift() as string;

    if (graph[currentId]) {
      for (const nextId of graph[currentId]) {
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push(nextId);
        }
      }
    }
  }

  return visited;
}

/**
 * Performs topological sort on a graph with a preferred start node
 */
export function topologicalSortFromNode(
  startNodeId: string,
  nodes: Node[],
  edges: Edge[]
): string[] {
  // Build directed graph
  const { graph } = buildGraph(nodes, edges);

  // Find all reachable nodes from start node
  const reachableNodeIds = getReachableNodes(startNodeId, graph);

  // Filter to only reachable nodes and edges
  const relevantNodes = nodes.filter((node) => reachableNodeIds.has(node.id));
  const relevantEdges = edges.filter(
    (edge) =>
      reachableNodeIds.has(edge.source) && reachableNodeIds.has(edge.target)
  );

  // Build graph for topological sorting
  const { graph: sortGraph, inDegree } = buildGraph(
    relevantNodes,
    relevantEdges
  );

  // Execute Kahn's algorithm, starting from start node
  const result: string[] = [];
  const sortQueue: string[] = [startNodeId];

  while (sortQueue.length > 0) {
    const nodeId = sortQueue.shift() as string;
    result.push(nodeId);

    sortGraph[nodeId].forEach((nextId) => {
      inDegree[nextId]--;
      if (inDegree[nextId] === 0) {
        sortQueue.push(nextId);
      }
    });
  }

  // Add any nodes from our set that weren't processed (cycles)
  const processedIds = new Set(result);
  relevantNodes.forEach((node) => {
    if (!processedIds.has(node.id)) {
      result.push(node.id);
    }
  });

  return result;
}

/**
 * Performs standard topological sort on a graph
 */
export function topologicalSort(nodes: Node[], edges: Edge[]): string[] {
  // Build graph
  const { graph, inDegree } = buildGraph(nodes, edges);

  // Execute Kahn's algorithm
  const result: string[] = [];
  const queue: string[] = [];

  // Add all nodes with no dependencies
  nodes.forEach((node) => {
    if (inDegree[node.id] === 0) {
      queue.push(node.id);
    }
  });

  while (queue.length > 0) {
    const nodeId = queue.shift() as string;
    result.push(nodeId);

    graph[nodeId].forEach((nextId) => {
      inDegree[nextId]--;
      if (inDegree[nextId] === 0) {
        queue.push(nextId);
      }
    });
  }

  // Add any nodes that weren't processed (cycles)
  if (result.length !== nodes.length) {
    const processed = new Set(result);
    nodes.forEach((node) => {
      if (!processed.has(node.id)) {
        result.push(node.id);
      }
    });
  }

  return result;
}

/**
 * Calculate execution order based on graph topology
 */
export function calculateExecutionOrder(
  nodes: Node[],
  edges: Edge[]
): string[] {
  if (nodes.length === 0) return [];
  if (nodes.length === 1) return [nodes[0].id];

  // Find start node if one is marked
  const startNode = nodes.find((node) => node.data.isStartNode === true);

  // If there's a start node, execute only from it down the graph
  if (startNode) {
    return topologicalSortFromNode(startNode.id, nodes, edges);
  }

  // If no start node, use standard topological sort
  return topologicalSort(nodes, edges);
}
