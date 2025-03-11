/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/scenarios_module/scenarioStore.ts
import { create } from "zustand";
import { Template } from "../templates_module/templateStore";
import { Node, Edge } from "./types";
import { PluginConfig } from "../plugins_system/types";
import {
  initialCategories,
  initialEdges,
  initialNodeResponses,
  initialNodes,
} from "../init_data/mockScenarioData";

interface ScenarioState {
  nodes: Record<string, Node>;
  edges: Edge[];
  categories: string[];
  nodeResponses: Record<string, string>;

  // Actions for nodes
  setNodes: (nodes: Record<string, Node>) => void;
  addNode: (
    id: string,
    message: string,
    category: string,
    templateData?: Template
  ) => void;
  removeNode: (id: string) => void;
  
  // Plugin related actions
  assignPluginToNode: (nodeId: string, pluginId: string, initialConfig?: PluginConfig) => void;
  updateNodePluginConfig: (nodeId: string, configUpdates: Partial<PluginConfig>) => void;
  removePluginFromNode: (nodeId: string) => void;

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

  // Export/Import scenario
  exportToJson: () => Record<string, any>;
  importFromJson: (data: Record<string, any>) => void;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  // Default scenario data loaded from mock data
  nodes: initialNodes,
  edges: initialEdges,
  categories: initialCategories,
  nodeResponses: initialNodeResponses,

  // Node actions
  setNodes: (nodes) => set({ nodes }),
  addNode: (id, message, category, templateData) =>
    set((state) => ({
      nodes: {
        ...state.nodes,
        [id]: { 
          id, 
          message, 
          category,
          // Only include templateData if it's provided and not empty
          ...(templateData && Object.keys(templateData).length > 0 ? { templateData } : {})
        },
      },
      // Add category if it doesn't exist
      categories: state.categories.includes(category) 
        ? state.categories 
        : [...state.categories, category]
    })),
  removeNode: (id) =>
    set((state) => {
      const newNodes = { ...state.nodes };
      delete newNodes[id];

      const filteredEdges = state.edges.filter(
        (edge) => edge.source !== id && edge.target !== id
      );

      const newResponses = { ...state.nodeResponses };
      delete newResponses[id];

      return {
        nodes: newNodes,
        edges: filteredEdges,
        nodeResponses: newResponses,
      };
    }),
    
  // Plugin related actions  
  assignPluginToNode: (nodeId, pluginId, initialConfig = {}) =>
    set((state) => {
      if (!state.nodes[nodeId]) return state;
      
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...state.nodes[nodeId],
            pluginId,
            pluginConfig: initialConfig,
          },
        },
      };
    }),
    
  updateNodePluginConfig: (nodeId, configUpdates) =>
    set((state) => {
      if (!state.nodes[nodeId] || !state.nodes[nodeId].pluginId) return state;
      
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: {
            ...state.nodes[nodeId],
            pluginConfig: {
              ...(state.nodes[nodeId].pluginConfig || {}),
              ...configUpdates,
            },
          },
        },
      };
    }),
    
  removePluginFromNode: (nodeId) =>
    set((state) => {
      if (!state.nodes[nodeId]) return state;
      
      const updatedNode = { ...state.nodes[nodeId] };
      delete updatedNode.pluginId;
      delete updatedNode.pluginConfig;
      
      return {
        nodes: {
          ...state.nodes,
          [nodeId]: updatedNode,
        },
      };
    }),

  // Edge actions
  setEdges: (edges) => set({ edges }),
  addEdge: (source, target) =>
    set((state) => {
      if (state.edges.some((e) => e.source === source && e.target === target)) {
        return { edges: state.edges };
      }
      return {
        edges: [...state.edges, { source, target }],
      };
    }),
  removeEdge: (source, target) =>
    set((state) => ({
      edges: state.edges.filter(
        (edge) => !(edge.source === source && edge.target === target)
      ),
    })),

  // Category actions
  setCategories: (categories) => set({ categories }),
  addCategory: (category) =>
    set((state) => {
      if (state.categories.includes(category)) {
        return { categories: state.categories };
      }
      return {
        categories: [...state.categories, category],
      };
    }),

  // Response actions
  setNodeResponses: (responses) => set({ nodeResponses: responses }),
  addNodeResponse: (nodeId, response) =>
    set((state) => ({
      nodeResponses: {
        ...state.nodeResponses,
        [nodeId]: response,
      },
    })),
  removeNodeResponse: (nodeId) =>
    set((state) => {
      const newResponses = { ...state.nodeResponses };
      delete newResponses[nodeId];
      return {
        nodeResponses: newResponses,
      };
    }),

  // Export/Import scenario
  exportToJson: () => {
    const { nodes, edges, categories, nodeResponses } = get();
    return {
      nodes,
      edges,
      categories,
      nodeResponses,
    };
  },
  importFromJson: (data) => {
    if (data.nodes) set({ nodes: data.nodes });
    if (data.edges) set({ edges: data.edges });
    if (data.categories) set({ categories: data.categories });
    if (data.nodeResponses) set({ nodeResponses: data.nodeResponses });
  },
}));