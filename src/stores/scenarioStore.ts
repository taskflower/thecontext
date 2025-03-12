// src/stores/scenarioStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useWorkspaceStore } from './workspaceStore';
import { useNodeStore } from './nodeStore';


export interface Scenario {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  isTemplate: boolean;
  templateId?: string;
  nodeIds: string[];
  edgeIds: string[];
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}

interface ScenarioState {
  scenarios: Record<string, Scenario>;
  edges: Record<string, Edge>;
  currentScenarioId: string | null;
  templates: Record<string, Scenario>;
}

interface ScenarioActions {
  // Scenario CRUD
  createScenario: (name: string, workspaceId: string, description?: string) => string;
  updateScenario: (id: string, updates: Partial<Omit<Scenario, 'id' | 'workspaceId' | 'createdAt'>>) => void;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string, newName?: string, newWorkspaceId?: string) => string;
  
  // Scenario selection
  setCurrentScenario: (id: string | null) => void;
  getCurrentScenario: () => Scenario | null;
  
  // Node management within scenario
  addNodeToScenario: (scenarioId: string, nodeId: string) => void;
  removeNodeFromScenario: (scenarioId: string, nodeId: string) => void;
  
  // Edge management
  createEdge: (source: string, target: string, sourceHandle?: string, targetHandle?: string, label?: string) => string;
  updateEdge: (id: string, updates: Partial<Omit<Edge, 'id'>>) => void;
  deleteEdge: (id: string) => void;
  addEdgeToScenario: (scenarioId: string, edgeId: string) => void;
  removeEdgeFromScenario: (scenarioId: string, edgeId: string) => void;
  
  // Template management
  createTemplate: (scenarioId: string, name?: string, description?: string) => string;
  deleteTemplate: (templateId: string) => void;
  applyTemplate: (templateId: string, workspaceId: string, name?: string) => string;
  
  // Get scenario by ID
  getScenario: (id: string) => Scenario | null;
  
  // Import/Export
  exportScenario: (id: string) => string;
  importScenario: (data: string | object, workspaceId?: string) => string;
}

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
  persist(
    (set, get) => ({
      scenarios: {},
      edges: {},
      currentScenarioId: null,
      templates: {},
      
      // Scenario CRUD
      createScenario: (name, workspaceId, description = '') => {
        const id = nanoid();
        const scenario: Scenario = {
          id,
          workspaceId,
          name,
          description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isTemplate: false,
          nodeIds: [],
          edgeIds: []
        };
        
        set((state) => ({
          scenarios: { ...state.scenarios, [id]: scenario },
          currentScenarioId: id
        }));
        
        // Add to workspace
        const workspaceStore = useWorkspaceStore.getState();
        workspaceStore.addScenarioToWorkspace(workspaceId, id);
        
        return id;
      },
      
      updateScenario: (id, updates) => {
        set((state) => {
          if (!state.scenarios[id]) return state;
          
          return {
            scenarios: {
              ...state.scenarios,
              [id]: {
                ...state.scenarios[id],
                ...updates,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      deleteScenario: (id) => {
        set((state) => {
          const scenario = state.scenarios[id];
          if (!scenario) return state;
          
          // Get nodes to delete
          const nodeIds = scenario.nodeIds || [];
          const edgeIds = scenario.edgeIds || [];
          
          // Delete associated nodes
          const nodeStore = useNodeStore.getState();
          nodeIds.forEach(nodeId => {
            nodeStore.deleteNode(nodeId);
          });
          
          // Remove from workspace
          const workspaceStore = useWorkspaceStore.getState();
          workspaceStore.removeScenarioFromWorkspace(scenario.workspaceId, id);
          
          // Create new states
          const newScenarios = { ...state.scenarios };
          delete newScenarios[id];
          
          const newEdges = { ...state.edges };
          edgeIds.forEach(edgeId => {
            delete newEdges[edgeId];
          });
          
          // Update current scenario if needed
          let newCurrentId = state.currentScenarioId;
          if (newCurrentId === id) {
            const remainingIds = Object.keys(newScenarios);
            newCurrentId = remainingIds.length > 0 ? remainingIds[0] : null;
          }
          
          return {
            scenarios: newScenarios,
            edges: newEdges,
            currentScenarioId: newCurrentId
          };
        });
      },
      
      duplicateScenario: (id, newName, newWorkspaceId) => {
        const scenario = get().scenarios[id];
        if (!scenario) return '';
        
        const newId = nanoid();
        const name = newName || `${scenario.name} (Copy)`;
        const workspaceId = newWorkspaceId || scenario.workspaceId;
        
        // Duplicate nodes
        const nodeStore = useNodeStore.getState();
        const nodeIdMap: Record<string, string> = {};
        
        scenario.nodeIds.forEach(nodeId => {
          const newNodeId = nodeStore.duplicateNode(nodeId);
          nodeIdMap[nodeId] = newNodeId;
        });
        
        // Create new edges with updated references
        const newEdgeIds: string[] = [];
        scenario.edgeIds.forEach(edgeId => {
          const edge = get().edges[edgeId];
          if (edge && nodeIdMap[edge.source] && nodeIdMap[edge.target]) {
            const newEdgeId = get().createEdge(
              nodeIdMap[edge.source],
              nodeIdMap[edge.target],
              edge.sourceHandle,
              edge.targetHandle,
              edge.label
            );
            newEdgeIds.push(newEdgeId);
          }
        });
        
        // Create new scenario
        const newScenario: Scenario = {
          ...scenario,
          id: newId,
          workspaceId,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          nodeIds: Object.values(nodeIdMap),
          edgeIds: newEdgeIds
        };
        
        set((state) => ({
          scenarios: { ...state.scenarios, [newId]: newScenario }
        }));
        
        // Add to workspace
        const workspaceStore = useWorkspaceStore.getState();
        workspaceStore.addScenarioToWorkspace(workspaceId, newId);
        
        return newId;
      },
      
      // Scenario selection
      setCurrentScenario: (id) => {
        set({ currentScenarioId: id });
      },
      
      getCurrentScenario: () => {
        const { currentScenarioId, scenarios } = get();
        return currentScenarioId ? scenarios[currentScenarioId] : null;
      },
      
      // Node management within scenario
      addNodeToScenario: (scenarioId, nodeId) => {
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;
          
          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: {
                ...scenario,
                nodeIds: [...scenario.nodeIds, nodeId],
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      removeNodeFromScenario: (scenarioId, nodeId) => {
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;
          
          // Also remove edges connected to this node
          const edgesToRemove = scenario.edgeIds.filter(edgeId => {
            const edge = state.edges[edgeId];
            return edge && (edge.source === nodeId || edge.target === nodeId);
          });
          
          const newEdgeIds = scenario.edgeIds.filter(edgeId => !edgesToRemove.includes(edgeId));
          
          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: {
                ...scenario,
                nodeIds: scenario.nodeIds.filter(id => id !== nodeId),
                edgeIds: newEdgeIds,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      // Edge management
      createEdge: (source, target, sourceHandle, targetHandle, label) => {
        const id = nanoid();
        const edge: Edge = {
          id,
          source,
          target,
          sourceHandle,
          targetHandle,
          label
        };
        
        set((state) => ({
          edges: { ...state.edges, [id]: edge }
        }));
        
        return id;
      },
      
      updateEdge: (id, updates) => {
        set((state) => {
          if (!state.edges[id]) return state;
          
          return {
            edges: {
              ...state.edges,
              [id]: {
                ...state.edges[id],
                ...updates
              }
            }
          };
        });
      },
      
      deleteEdge: (id) => {
        set((state) => {
          const newEdges = { ...state.edges };
          delete newEdges[id];
          
          // Also remove from any scenarios
          const updatedScenarios = { ...state.scenarios };
          
          Object.entries(updatedScenarios).forEach(([scenarioId, scenario]) => {
            if (scenario.edgeIds.includes(id)) {
              updatedScenarios[scenarioId] = {
                ...scenario,
                edgeIds: scenario.edgeIds.filter(edgeId => edgeId !== id)
              };
            }
          });
          
          return {
            edges: newEdges,
            scenarios: updatedScenarios
          };
        });
      },
      
      addEdgeToScenario: (scenarioId, edgeId) => {
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;
          
          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: {
                ...scenario,
                edgeIds: [...scenario.edgeIds, edgeId],
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      removeEdgeFromScenario: (scenarioId, edgeId) => {
        set((state) => {
          const scenario = state.scenarios[scenarioId];
          if (!scenario) return state;
          
          return {
            scenarios: {
              ...state.scenarios,
              [scenarioId]: {
                ...scenario,
                edgeIds: scenario.edgeIds.filter(id => id !== edgeId),
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      // Template management
      createTemplate: (scenarioId, name, description) => {
        const scenario = get().scenarios[scenarioId];
        if (!scenario) return '';
        
        const templateId = nanoid();
        const templateName = name || `${scenario.name} Template`;
        const templateDesc = description || `Template created from ${scenario.name}`;
        
        // Duplicate scenario structure for template
        const template: Scenario = {
          ...scenario,
          id: templateId,
          name: templateName,
          description: templateDesc,
          isTemplate: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        set((state) => ({
          templates: { ...state.templates, [templateId]: template }
        }));
        
        return templateId;
      },
      
      deleteTemplate: (templateId) => {
        set((state) => {
          const newTemplates = { ...state.templates };
          delete newTemplates[templateId];
          
          return {
            templates: newTemplates
          };
        });
      },
      
      applyTemplate: (templateId, workspaceId, name) => {
        const template = get().templates[templateId];
        if (!template) return '';
        
        const newName = name || `${template.name} Instance`;
        
        // Create new scenario from template
        const scenarioId = get().createScenario(newName, workspaceId, template.description);
        
        // Update with template info
        get().updateScenario(scenarioId, {
          templateId,
          updatedAt: Date.now()
        });
        
        // Create nodes and edges based on template
        const nodeStore = useNodeStore.getState();
        const nodeIdMap: Record<string, string> = {};
        
        // Create nodes
        template.nodeIds.forEach(originalNodeId => {
          // Get original node template from source scenario
          const originalNode = nodeStore.getOriginalNodeOfTemplate(originalNodeId);
          if (originalNode) {
            // Create node based on template
            const newNodeId = nodeStore.createNode(
              originalNode.type,
              originalNode.position,
              originalNode.data,
              scenarioId
            );
            
            nodeIdMap[originalNodeId] = newNodeId;
            get().addNodeToScenario(scenarioId, newNodeId);
          }
        });
        
        // Create edges
        template.edgeIds.forEach(edgeId => {
          const edge = get().edges[edgeId];
          if (edge && nodeIdMap[edge.source] && nodeIdMap[edge.target]) {
            const newEdgeId = get().createEdge(
              nodeIdMap[edge.source],
              nodeIdMap[edge.target],
              edge.sourceHandle,
              edge.targetHandle,
              edge.label
            );
            get().addEdgeToScenario(scenarioId, newEdgeId);
          }
        });
        
        return scenarioId;
      },
      
      // Get scenario by ID
      getScenario: (id) => {
        return get().scenarios[id] || null;
      },
      
      // Import/Export
      exportScenario: (id) => {
        const scenario = get().scenarios[id];
        if (!scenario) return '';
        
        // Get nodes
        const nodeStore = useNodeStore.getState();
        const nodes = scenario.nodeIds.map(nodeId => nodeStore.getNode(nodeId));
        
        // Get edges
        const edges = scenario.edgeIds.map(edgeId => get().edges[edgeId]);
        
        const exportData = {
          scenario,
          nodes,
          edges
        };
        
        return JSON.stringify(exportData);
      },
      
      importScenario: (data, workspaceId) => {
        try {
          const importData = typeof data === 'string' ? JSON.parse(data) : data;
          const { scenario, nodes, edges } = importData;
          
          if (!scenario || !Array.isArray(nodes) || !Array.isArray(edges)) {
            throw new Error('Invalid import data format');
          }
          
          // Generate new ID to avoid collisions
          const newId = nanoid();
          const targetWorkspaceId = workspaceId || scenario.workspaceId;
          
          // Create new scenario shell
          const newScenario: Scenario = {
            ...scenario,
            id: newId,
            workspaceId: targetWorkspaceId,
            nodeIds: [],
            edgeIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          // Import nodes
          const nodeStore = useNodeStore.getState();
          const nodeIdMap: Record<string, string> = {};
          
          // Create nodes
          nodes.forEach(nodeData => {
            if (nodeData) {
              const originalId = nodeData.id;
              const newNodeId = nodeStore.createNode(
                nodeData.type,
                nodeData.position,
                nodeData.data,
                newId
              );
              
              nodeIdMap[originalId] = newNodeId;
              newScenario.nodeIds.push(newNodeId);
            }
          });
          
          // Create edges with updated references
          const newEdges: Record<string, Edge> = {};
          
          edges.forEach(edgeData => {
            if (edgeData && nodeIdMap[edgeData.source] && nodeIdMap[edgeData.target]) {
              const newEdgeId = nanoid();
              const newEdge: Edge = {
                id: newEdgeId,
                source: nodeIdMap[edgeData.source],
                target: nodeIdMap[edgeData.target],
                sourceHandle: edgeData.sourceHandle,
                targetHandle: edgeData.targetHandle,
                label: edgeData.label
              };
              
              newEdges[newEdgeId] = newEdge;
              newScenario.edgeIds.push(newEdgeId);
            }
          });
          
          // Add to store
          set((state) => ({
            scenarios: { ...state.scenarios, [newId]: newScenario },
            edges: { ...state.edges, ...newEdges },
            currentScenarioId: newId
          }));
          
          // Add to workspace
          const workspaceStore = useWorkspaceStore.getState();
          workspaceStore.addScenarioToWorkspace(targetWorkspaceId, newId);
          
          return newId;
        } catch (e) {
          console.error('Error importing scenario:', e);
          return '';
        }
      }
    }),
    {
      name: 'scenario-storage',
      partialize: (state) => ({
        scenarios: state.scenarios,
        edges: state.edges,
        templates: state.templates,
        currentScenarioId: state.currentScenarioId
      })
    }
  )
);