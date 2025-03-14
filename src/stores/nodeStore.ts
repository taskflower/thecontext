// src/stores/nodeStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Node, NodeData,  } from '../types/common';
import { Position } from 'reactflow';



interface NodeState {
  nodes: Record<string, Node>;
  activeNodeId: string | null;
}

interface NodeActions {
  createNode: (
    type: string,
    position: Position,
    data?: NodeData,
    scenarioId?: string
  ) => string;
  updateNode: (id: string, updates: Partial<Omit<Node, 'id' | 'scenarioId' | 'createdAt'>>) => void;
  deleteNode: (id: string) => void;
  duplicateNode: (id: string, newScenarioId?: string) => string;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  setNodeResponse: (id: string, response: string) => void;
  assignPluginToNode: (nodeId: string, pluginId: string, config?: Record<string, any>) => void;
  removePluginFromNode: (nodeId: string) => void;
  updateNodePluginConfig: (nodeId: string, configUpdates: Record<string, any>) => void;
  getNode: (id: string) => Node | null;
  getNodesByScenario: (scenarioId: string) => Node[];
  getNodeCountByScenario: (scenarioId: string) => number;
  setActiveNodeId: (id: string | null) => void;
  getActiveNode: () => Node | null;
  deleteNodesByScenario: (scenarioId: string) => void;
  setStartNode: (nodeId: string, scenarioId: string) => void;
  getStartNode: (scenarioId: string) => Node | null;
  updateOrAddNode: (
    nodeId: string | null, 
    type: string, 
    position: Position, 
    data: Partial<NodeData>, 
    scenarioId: string
  ) => string;
}

export const useNodeStore = create<NodeState & NodeActions>()(
  persist(
    (set, get) => ({
      nodes: {},
      activeNodeId: null,
      
      createNode: (type, position, data = {}, scenarioId) => {
        const id = nanoid();
        const node: Node = {
          id,
          type,
          position,
          data: {
            prompt: data.prompt || '',
            message: data.message || '',
            label: data.label || type,
            ...data
          },
          scenarioId: scenarioId || '',
          createdAt: Date.now(),
          updatedAt: Date.now()
        } as any;
        
        set((state) => ({
          nodes: { ...state.nodes, [id]: node }
        }));
        
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
          
          const newNodes = { ...state.nodes };
          delete newNodes[id];
          
          const activeNodeId = state.activeNodeId === id ? null : state.activeNodeId;
          
          return {
            nodes: newNodes,
            activeNodeId
          };
        });
      },
      
      duplicateNode: (id, newScenarioId) => {
        const node = get().nodes[id];
        if (!node) return '';
        
        const newId = nanoid();
        const scenarioId = newScenarioId || node.scenarioId;
        
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
        
        return newId;
      },
      
      updateNodeData: (id, data) => {
        set((state) => {
          if (!state.nodes[id]) return state;
          
          // Jeśli ustawiamy węzeł jako startowy, resetuj flagę dla innych węzłów w tym samym scenariuszu
          if (data.isStartNode === true) {
            const currentNode = state.nodes[id];
            const scenarioId = currentNode.scenarioId;
            
            // Resetowanie flagi dla innych węzłów
            Object.values(state.nodes).forEach(node => {
              if (node.scenarioId === scenarioId && node.id !== id && node.data.isStartNode) {
                node.data.isStartNode = false;
              }
            });
          }
          
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
      
      setNodeResponse: (id, message) => {
        set((state) => {
          if (!state.nodes[id]) return state;
          return {
            nodes: {
              ...state.nodes,
              [id]: {
                ...state.nodes[id],
                data: {
                  ...state.nodes[id].data,
                  message
                },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
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
      
      getNode: (id) => {
        return get().nodes[id] || null;
      },
      
      getNodesByScenario: (scenarioId) => {
        return Object.values(get().nodes).filter(node => node.scenarioId === scenarioId);
      },
      
      getNodeCountByScenario: (scenarioId) => {
        return Object.values(get().nodes).filter(node => node.scenarioId === scenarioId).length;
      },
      
      setActiveNodeId: (id) => {
        set({ activeNodeId: id });
      },
      
      getActiveNode: () => {
        const activeId = get().activeNodeId;
        return activeId ? get().nodes[activeId] : null;
      },
      
      setStartNode: (nodeId, scenarioId) => {
        set((state) => {
          const updatedNodes = { ...state.nodes };
          
          Object.values(updatedNodes)
            .filter(node => node.scenarioId === scenarioId && node.isStartNode)
            .forEach(node => {
              updatedNodes[node.id] = {
                ...node,
                isStartNode: false
              };
            });
          
          if (updatedNodes[nodeId] && updatedNodes[nodeId].scenarioId === scenarioId) {
            updatedNodes[nodeId] = {
              ...updatedNodes[nodeId],
              isStartNode: true
            };
          }
          
          return { nodes: updatedNodes };
        });
      },
      
      getStartNode: (scenarioId) => {
        const scenarioNodes = Object.values(get().nodes)
          .filter(node => node.scenarioId === scenarioId);
        const startNode = scenarioNodes.find(node => node.isStartNode);
        if (startNode) return startNode;
        return scenarioNodes.sort((a, b) => a.createdAt - b.createdAt)[0] || null;
      },
      
      deleteNodesByScenario: (scenarioId) => {
        set((state) => {
          const newNodes = { ...state.nodes };
          let newActiveNodeId = state.activeNodeId;
          
          Object.values(newNodes).forEach(node => {
            if (node.scenarioId === scenarioId) {
              delete newNodes[node.id];
              if (state.activeNodeId === node.id) {
                newActiveNodeId = null;
              }
            }
          });
          
          return {
            nodes: newNodes,
            activeNodeId: newActiveNodeId
          };
        });
      },

      // Funkcja łącząca aktualizację i dodawanie węzła
      updateOrAddNode: (nodeId, type, position, data, scenarioId) => {
        const store = get();
        if (nodeId && store.nodes[nodeId]) {
          store.updateNodeData(nodeId, data);
          return nodeId;
        } else {
          return store.createNode(type, position, data, scenarioId);
        }
      }
    }),
    {
      name: 'node-storage',
      partialize: (state) => ({
        nodes: state.nodes,
        activeNodeId: state.activeNodeId
      })
    }
  )
);
