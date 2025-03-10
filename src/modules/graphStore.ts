/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/graphStore.ts
import { create } from 'zustand';

interface Node {
  id: string;
  message: string;
  category: string;
}

interface Edge {
  source: string;
  target: string;
}

interface Schema {
  name: string;
  description: string;
  nodes: Record<string, Node>;
  edges: Edge[];
}

interface GraphState {
  // Dane grafu
  nodes: Record<string, Node>;
  edges: Edge[];
  categories: string[];
  nodeResponses: Record<string, string>;
  
  // Zapisane schematy
  savedSchemas: Schema[];
  
  // Akcje
  setNodes: (nodes: Record<string, Node>) => void;
  addNode: (id: string, message: string, category: string) => void;
  removeNode: (id: string) => void;
  
  setEdges: (edges: Edge[]) => void;
  addEdge: (source: string, target: string) => void;
  removeEdge: (source: string, target: string) => void;
  
  setCategories: (categories: string[]) => void;
  addCategory: (category: string) => void;
  
  setNodeResponses: (responses: Record<string, string>) => void;
  addNodeResponse: (nodeId: string, response: string) => void;
  removeNodeResponse: (nodeId: string) => void;
  
  setSavedSchemas: (schemas: Schema[]) => void;
  addSchema: (schema: Schema) => void;
  
  // Eksport/Import
  exportToJson: () => Record<string, any>;
  importFromJson: (data: Record<string, any>) => void;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  // Stan początkowy
  nodes: {
    'start': { id: 'start', message: 'Rozpoczynamy sekwencję promptów', category: 'default' },
    'krok1': { id: 'krok1', message: 'Pierwszy krok w sekwencji', category: 'default' },
    'krok2': { id: 'krok2', message: 'Drugi krok w sekwencji', category: 'procesy' }
  },
  edges: [
    { source: 'start', target: 'krok1' },
    { source: 'krok1', target: 'krok2' }
  ],
  categories: ['default', 'procesy'],
  nodeResponses: {},
  savedSchemas: [
    {
      name: 'Przykładowy schemat',
      description: 'Prosty schemat z dwoma krokami',
      nodes: {
        'node1': { id: 'node1', message: 'Pierwszy węzeł schematu', category: 'default' },
        'node2': { id: 'node2', message: 'Drugi węzeł schematu', category: 'default' }
      },
      edges: [{ source: 'node1', target: 'node2' }]
    }
  ],
  
  // Akcje dla węzłów
  setNodes: (nodes) => set({ nodes }),
  addNode: (id, message, category) => set((state) => ({
    nodes: {
      ...state.nodes,
      [id]: { id, message, category }
    }
  })),
  removeNode: (id) => set((state) => {
    const { [id]: removed, ...restNodes } = state.nodes;
    const filteredEdges = state.edges.filter(edge => edge.source !== id && edge.target !== id);
    const { [id]: removedResponse, ...restResponses } = state.nodeResponses;
    
    return {
      nodes: restNodes,
      edges: filteredEdges,
      nodeResponses: restResponses
    };
  }),
  
  // Akcje dla krawędzi
  setEdges: (edges) => set({ edges }),
  addEdge: (source, target) => set((state) => {
    // Sprawdź, czy taka krawędź już istnieje
    if (state.edges.some(e => e.source === source && e.target === target)) {
      return { edges: state.edges };
    }
    return {
      edges: [...state.edges, { source, target }]
    };
  }),
  removeEdge: (source, target) => set((state) => ({
    edges: state.edges.filter(edge => !(edge.source === source && edge.target === target))
  })),
  
  // Akcje dla kategorii
  setCategories: (categories) => set({ categories }),
  addCategory: (category) => set((state) => {
    if (state.categories.includes(category)) {
      return { categories: state.categories };
    }
    return {
      categories: [...state.categories, category]
    };
  }),
  
  // Akcje dla odpowiedzi
  setNodeResponses: (responses) => set({ nodeResponses: responses }),
  addNodeResponse: (nodeId, response) => set((state) => ({
    nodeResponses: {
      ...state.nodeResponses,
      [nodeId]: response
    }
  })),
  removeNodeResponse: (nodeId) => set((state) => {
    const { [nodeId]: removed, ...rest } = state.nodeResponses;
    return {
      nodeResponses: rest
    };
  }),
  
  // Akcje dla schematów
  setSavedSchemas: (schemas) => set({ savedSchemas: schemas }),
  addSchema: (schema) => set((state) => ({
    savedSchemas: [...state.savedSchemas, schema]
  })),
  
  // Eksport/Import
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