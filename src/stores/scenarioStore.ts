// src/stores/scenarioStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Edge, Scenario } from '../types/common';
import { useNodeStore } from './nodeStore';
import { useWorkspaceStore } from './workspaceStore';

interface ScenarioState {
  scenarios: Record<string, Scenario>;
  edges: Record<string, Edge>;
  currentScenarioId: string | null;
  templates: Record<string, Scenario>;
}

interface ScenarioActions {
  createScenario: (name: string, workspaceId: string, description?: string) => string;
  updateScenario: (id: string, updates: Partial<Omit<Scenario, 'id' | 'workspaceId' | 'createdAt'>>) => void;
  deleteScenario: (id: string) => void;
  duplicateScenario: (id: string, newName?: string, newWorkspaceId?: string) => string;
  setCurrentScenario: (id: string | null) => void;
  getCurrentScenario: () => Scenario | null;
  createEdge: (source: string, target: string, sourceHandle?: string, targetHandle?: string, label?: string) => string;
  updateEdge: (id: string, updates: Partial<Omit<Edge, 'id'>>) => void;
  deleteEdge: (id: string) => void;
  addEdgeToScenario: (scenarioId: string, edgeId: string) => void;
  removeEdgeFromScenario: (scenarioId: string, edgeId: string) => void;
  getValidEdges: (scenarioId: string) => Edge[];
  getScenario: (id: string) => Scenario | null;
  validateScenarioEdges: (scenarioId: string) => void;
}

export const useScenarioStore = create<ScenarioState & ScenarioActions>()(
  persist(
    (set, get) => ({
      scenarios: {},
      edges: {},
      currentScenarioId: null,
      templates: {},
      
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
          edgeIds: []
        };
        
        set((state) => ({
          scenarios: { ...state.scenarios, [id]: scenario },
          currentScenarioId: id
        }));
        
        // Dodanie do workspace
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
          
          // Usunięcie powiązanych węzłów
          const nodeStore = useNodeStore.getState();
          nodeStore.deleteNodesByScenario(id);
          
          // Usunięcie krawędzi
          const edgeIds = scenario.edgeIds || [];
          
          const newScenarios = { ...state.scenarios };
          delete newScenarios[id];
          
          const newEdges = { ...state.edges };
          edgeIds.forEach(edgeId => {
            delete newEdges[edgeId];
          });
          
          // Aktualizacja bieżącego scenariusza
          let newCurrentId = state.currentScenarioId;
          if (newCurrentId === id) {
            const remainingIds = Object.keys(newScenarios);
            newCurrentId = remainingIds.length > 0 ? remainingIds[0] : null;
          }
          
          // Usunięcie ze workspace
          const workspaceStore = useWorkspaceStore.getState();
          workspaceStore.removeScenarioFromWorkspace(scenario.workspaceId, id);
          
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
        
        // Duplikacja węzłów
        const nodeStore = useNodeStore.getState();
        const scenarioNodes = nodeStore.getNodesByScenario(id);
        const nodeIdMap: Record<string, string> = {};
        
        scenarioNodes.forEach(node => {
          const newNodeId = nodeStore.duplicateNode(node.id, newId);
          nodeIdMap[node.id] = newNodeId;
        });
        
        // Tworzenie nowych krawędzi z zaktualizowanymi referencjami
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
        
        // Tworzenie nowego scenariusza
        const newScenario: Scenario = {
          ...scenario,
          id: newId,
          workspaceId,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          edgeIds: newEdgeIds
        };
        
        set((state) => ({
          scenarios: { ...state.scenarios, [newId]: newScenario }
        }));
        
        // Dodanie do workspace
        const workspaceStore = useWorkspaceStore.getState();
        workspaceStore.addScenarioToWorkspace(workspaceId, newId);
        
        return newId;
      },
      
      setCurrentScenario: (id) => {
        set({ currentScenarioId: id });
      },
      
      getCurrentScenario: () => {
        const { currentScenarioId, scenarios } = get();
        return currentScenarioId ? scenarios[currentScenarioId] : null;
      },
      
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
          
          // Usunięcie z dowolnych scenariuszy
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
          
          // Sprawdź czy krawędź już istnieje w scenariuszu
          if (scenario.edgeIds.includes(edgeId)) {
            return state;
          }
          
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
      
      getValidEdges: (scenarioId) => {
        const scenario = get().scenarios[scenarioId];
        if (!scenario) return [];
        
        const nodeStore = useNodeStore.getState();
        const scenarioNodes = nodeStore.getNodesByScenario(scenarioId);
        const validNodeIds = new Set(scenarioNodes.map(node => node.id));
        
        return scenario.edgeIds
          .map(edgeId => get().edges[edgeId])
          .filter(edge => edge && validNodeIds.has(edge.source) && validNodeIds.has(edge.target));
      },
      
      getScenario: (id) => {
        return get().scenarios[id] || null;
      },
      
      validateScenarioEdges: (scenarioId) => {
        const scenario = get().scenarios[scenarioId];
        if (!scenario) return;
        
        const validEdges = get().getValidEdges(scenarioId);
        const validEdgeIds = validEdges.map(edge => edge.id);
        
        if (validEdgeIds.length !== scenario.edgeIds.length) {
          get().updateScenario(scenarioId, {
            edgeIds: validEdgeIds
          });
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