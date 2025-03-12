/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/nodeStore.ts - Modified version
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useScenarioStore } from './scenarioStore';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  content?: string;
  prompt?: string;
  response?: string;
  variables?: Record<string, string>;
  pluginId?: string;
  pluginConfig?: Record<string, any>;
  [key: string]: any;
}

export interface Node {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
  scenarioId: string;
  createdAt: number;
  updatedAt: number;
}

interface NodeState {
  nodes: Record<string, Node>;
  nodeResponses: Record<string, string>;
  templateNodes: Record<string, string>;
  activeNodeId: string | null; // Added property
}

interface NodeActions {
  // Node CRUD
  createNode: (
    type: string,
    position: Position,
    data?: NodeData,
    scenarioId?: string
  ) => string;
  updateNode: (id: string, updates: Partial<Omit<Node, 'id' | 'scenarioId' | 'createdAt'>>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string, newScenarioId?: string) => string;
  
  // Node data management
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  setNodeResponse: (id: string, response: string) => void;
  
  // Plugin connections
  assignPluginToNode: (nodeId: string, pluginId: string, config?: Record<string, any>) => void;
  removePluginFromNode: (nodeId: string) => void;
  updateNodePluginConfig: (nodeId: string, configUpdates: Record<string, any>) => void;
  
  // Template node management
  registerTemplateNode: (templateNodeId: string, originalNodeId: string) => void;
  getOriginalNodeOfTemplate: (templateNodeId: string) => Node | null;
  
  // Get node by ID
  getNode: (id: string) => Node | null;
  
  // Variable handling
  getNodeWithVariable: (variableName: string) => Node | null;
  getAllNodesWithVariables: () => Record<string, string[]>;
  
  // Active node management - added actions
  setActiveNodeId: (id: string | null) => void;
  getActiveNode: () => Node | null;
}

export const useNodeStore = create<NodeState & NodeActions>()(
  persist(
    (set, get) => ({
      nodes: {},
      nodeResponses: {},
      templateNodes: {},
      activeNodeId: null, // Initialize with null
      
      // Node CRUD
      createNode: (type, position, data = {}, scenarioId) => {
        const id = nanoid();
        const node: Node = {
          id,
          type,
          position,
          data: data || {},
          scenarioId: scenarioId || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set((state) => ({
          nodes: { ...state.nodes, [id]: node }
        }));
        
        // Add to scenario if provided
        if (scenarioId) {
          const scenarioStore = useScenarioStore.getState();
          scenarioStore.addNodeToScenario(scenarioId, id);
        }
        
        return id;
      },
      
      updateNode: (id, updates) => {
        set((state) => {
          if (!state.nodes[id]) return state;
          
          return {
            nodes: {
              ...state.nodes,
              [id]: {
                ...state.nodes[id],
                ...updates,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      deleteNode: (id) => {
        set((state) => {
          const node = state.nodes[id];
          if (!node) return state;
          
          // Remove from scenario
          if (node.scenarioId) {
            const scenarioStore = useScenarioStore.getState();
            scenarioStore.removeNodeFromScenario(node.scenarioId, id);
          }
          
          // Create new states
          const newNodes = { ...state.nodes };
          delete newNodes[id];
          
          const newResponses = { ...state.nodeResponses };
          delete newResponses[id];
          
          // Clear active node if it's being deleted
          const activeNodeId = state.activeNodeId === id ? null : state.activeNodeId;
          
          return {
            nodes: newNodes,
            nodeResponses: newResponses,
            activeNodeId
          };
        });
      },
      
      duplicateNode: (id, newScenarioId) => {
        const node = get().nodes[id];
        if (!node) return '';
        
        const newId = nanoid();
        const scenarioId = newScenarioId || node.scenarioId;
        
        // Create new node
        const newNode: Node = {
          ...node,
          id: newId,
          scenarioId,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set((state) => ({
          nodes: { ...state.nodes, [newId]: newNode }
        }));
        
        // Add to scenario if needed and different from original
        if (scenarioId && scenarioId !== node.scenarioId) {
          const scenarioStore = useScenarioStore.getState();
          scenarioStore.addNodeToScenario(scenarioId, newId);
        }
        
        return newId;
      },
      
      // Node data management
      updateNodeData: (id, data) => {
        set((state) => {
          if (!state.nodes[id]) return state;
          
          return {
            nodes: {
              ...state.nodes,
              [id]: {
                ...state.nodes[id],
                data: { ...state.nodes[id].data, ...data },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      setNodeResponse: (id, response) => {
        set((state) => ({
          nodeResponses: { ...state.nodeResponses, [id]: response }
        }));
      },
      
      // Plugin connections
      assignPluginToNode: (nodeId, pluginId, config = {}) => {
        set((state) => {
          if (!state.nodes[nodeId]) return state;
          
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...state.nodes[nodeId],
                data: {
                  ...state.nodes[nodeId].data,
                  pluginId,
                  pluginConfig: config
                },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      removePluginFromNode: (nodeId) => {
        set((state) => {
          if (!state.nodes[nodeId]) return state;
          
          const newData = { ...state.nodes[nodeId].data };
          delete newData.pluginId;
          delete newData.pluginConfig;
          
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...state.nodes[nodeId],
                data: newData,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      updateNodePluginConfig: (nodeId, configUpdates) => {
        set((state) => {
          if (!state.nodes[nodeId] || !state.nodes[nodeId].data.pluginId) return state;
          
          return {
            nodes: {
              ...state.nodes,
              [nodeId]: {
                ...state.nodes[nodeId],
                data: {
                  ...state.nodes[nodeId].data,
                  pluginConfig: {
                    ...state.nodes[nodeId].data.pluginConfig,
                    ...configUpdates
                  }
                },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      // Template node management
      registerTemplateNode: (templateNodeId, originalNodeId) => {
        set((state) => ({
          templateNodes: { ...state.templateNodes, [templateNodeId]: originalNodeId }
        }));
      },
      
      getOriginalNodeOfTemplate: (templateNodeId) => {
        const originalNodeId = get().templateNodes[templateNodeId];
        if (!originalNodeId) return null;
        
        return get().nodes[originalNodeId] || null;
      },
      
      // Get node by ID
      getNode: (id) => {
        return get().nodes[id] || null;
      },
      
      // Variable handling
      getNodeWithVariable: (variableName) => {
        const allNodes = get().nodes;
        
        for (const id in allNodes) {
          const node = allNodes[id];
          const variables = node.data.variables || {};
          
          if (Object.values(variables).includes(variableName)) {
            return node;
          }
        }
        
        return null;
      },
      
      getAllNodesWithVariables: () => {
        const allNodes = get().nodes;
        const result: Record<string, string[]> = {};
        
        for (const id in allNodes) {
          const node = allNodes[id];
          const variables = node.data.variables || {};
          
          if (Object.keys(variables).length > 0) {
            result[id] = Object.values(variables);
          }
        }
        
        return result;
      },
      
      // Active node management - implemented new actions
      setActiveNodeId: (id) => {
        set({ activeNodeId: id });
      },
      
      getActiveNode: () => {
        const activeId = get().activeNodeId;
        return activeId ? get().nodes[activeId] : null;
      }
    }),
    {
      name: 'node-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        nodeResponses: state.nodeResponses,
        templateNodes: state.templateNodes,
        activeNodeId: state.activeNodeId // Include in persisted state
      })
    }
  )
);