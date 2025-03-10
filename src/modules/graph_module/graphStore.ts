/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/graphStore.ts
import { create } from 'zustand';
import { Scenario } from '../scenarios_module/scenarioStore';


interface Node {
  id: string;
  message: string;
  category: string;
  scenarioData?: Scenario; // For scenario nodes
}

interface Edge {
  source: string;
  target: string;
}

interface GraphState {
  nodes: Record<string, Node>;
  edges: Edge[];
  categories: string[];
  nodeResponses: Record<string, string>;

  // Actions for nodes
  setNodes: (nodes: Record<string, Node>) => void;
  addNode: (id: string, message: string, category: string, scenarioData?: Scenario) => void;
  removeNode: (id: string) => void;

  // Actions for edges
  setEdges: (edges: Edge[]) => void;
  addEdge: (source: string, target: string) => void;
  removeEdge: (source: string, target: string) => void;

  // Actions for categories
  setCategories: (categories: string[]) => void;
  addCategory: (category: string) => void;

  // Actions for responses
  setNodeResponses: (responses: Record<string, string>) => void;
  addNodeResponse: (nodeId: string, response: string) => void;
  removeNodeResponse: (nodeId: string) => void;

  // Export/Import graph
  exportToJson: () => Record<string, any>;
  importFromJson: (data: Record<string, any>) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Default graph data
  nodes: {
    'start': { id: 'start', message: 'Rozpoczynamy sekwencję promptów', category: 'default' },
    'step1': { id: 'step1', message: 'Pierwszy krok sekwencji', category: 'default' },
    'step2': { id: 'step2', message: 'Drugi krok sekwencji', category: 'flow' }
  },
  edges: [
    { source: 'start', target: 'step1' },
    { source: 'step1', target: 'step2' }
  ],
  categories: ['default', 'flow', 'scenario', 'procesy'],
  nodeResponses: {},

  // Node actions
  setNodes: (nodes) => set({ nodes }),
  addNode: (id, message, category, scenarioData) => set((state) => ({
    nodes: {
      ...state.nodes,
      [id]: { id, message, category, scenarioData }
    }
  })),
  removeNode: (id) => set((state) => {
    const newNodes = { ...state.nodes };
    delete newNodes[id];

    const filteredEdges = state.edges.filter(
      edge => edge.source !== id && edge.target !== id
    );

    const newResponses = { ...state.nodeResponses };
    delete newResponses[id];

    return {
      nodes: newNodes,
      edges: filteredEdges,
      nodeResponses: newResponses
    };
  }),

  // Edge actions
  setEdges: (edges) => set({ edges }),
  addEdge: (source, target) => set((state) => {
    if (state.edges.some(e => e.source === source && e.target === target)) {
      return { edges: state.edges };
    }
    return {
      edges: [...state.edges, { source, target }]
    };
  }),
  removeEdge: (source, target) => set((state) => ({
    edges: state.edges.filter(
      edge => !(edge.source === source && edge.target === target)
    )
  })),

  // Category actions
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => {
    if (state.categories.includes(category)) {
      return { categories: state.categories };
    }
    return {
      categories: [...state.categories, category]
    };
  }),

  // Response actions
  setNodeResponses: (responses) => set({ nodeResponses: responses }),
  addNodeResponse: (nodeId, response) => set((state) => ({
    nodeResponses: {
      ...state.nodeResponses,
      [nodeId]: response
    }
  })),
  removeNodeResponse: (nodeId) => set((state) => {
    const newResponses = { ...state.nodeResponses };
    delete newResponses[nodeId];
    return {
      nodeResponses: newResponses
    };
  }),

  // Export/Import graph
  exportToJson: () => {
    const { nodes, edges, categories, nodeResponses } = get();
    return {
      nodes,
      edges,
      categories,
      nodeResponses
    };
  },
  importFromJson: (data) => {
    if (data.nodes) set({ nodes: data.nodes });
    if (data.edges) set({ edges: data.edges });
    if (data.categories) set({ categories: data.categories });
    if (data.nodeResponses) set({ nodeResponses: data.nodeResponses });
  }
}));