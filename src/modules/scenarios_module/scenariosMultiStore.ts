// src/modules/scenarios_module/scenariosMultiStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Node, Edge } from "./types";
import { useScenarioStore } from "./scenarioStore";
import { WorkspaceContext } from "../workspace_module/workspaceStore";


export interface MultiScenario {
  id: string;
  name?: string;
  nodes: Record<string, Node>;
  edges: Edge[];
  categories: string[];
  nodeResponses: Record<string, string>;
  // Workspace connection
  workspaceId?: string;
  workspaceContext?: WorkspaceContext;
  // Metadata
  createdAt?: number;
  updatedAt?: number;
}

interface ScenariosMultiState {
  scenarios: Record<string, MultiScenario>;
  currentScenarioId: string | null;
  // Sets the active scenario
  setCurrentScenario: (id: string | null) => void;
  // Adds a new scenario and sets it as active
  addScenario: (scenario: MultiScenario) => void;
  // Updates a scenario using a modifier function
  updateScenario: (id: string, updater: (scenario: MultiScenario) => MultiScenario) => void;
  // Removes a scenario with the given ID
  removeScenario: (id: string) => void;
  // Exports a scenario
  exportScenario: (id: string) => MultiScenario | null;
  // Imports a scenario (adds it to the store)
  importScenario: (scenario: MultiScenario) => void;
  // Syncs the currently selected scenario to the active scenario store
  syncCurrentScenarioToActive: () => boolean;
  // Updates the workspace context for a scenario
  updateScenarioWorkspaceContext: (id: string, workspaceContext: WorkspaceContext) => void;
  // Syncs the active scenario from scenarioStore back to the current scenario in the multi-store
  syncActiveScenarioToCurrent: () => void;
}

export const useScenariosMultiStore = create<ScenariosMultiState>()(
  persist(
    (set, get) => ({
      scenarios: {},
      currentScenarioId: null,

      setCurrentScenario: (id) => set({ currentScenarioId: id }),

      addScenario: (scenario) => {
        const now = Date.now();
        const scenarioWithMeta = {
          ...scenario,
          createdAt: scenario.createdAt || now,
          updatedAt: now
        };
        
        set((state) => ({
          scenarios: { ...state.scenarios, [scenario.id]: scenarioWithMeta },
          currentScenarioId: scenario.id,
        }));
      },

      updateScenario: (id, updater) => set((state) => {
        const scenario = state.scenarios[id];
        if (!scenario) return state;
        
        const updatedScenario = {
          ...updater(scenario),
          updatedAt: Date.now()
        };
        
        return { 
          scenarios: { ...state.scenarios, [id]: updatedScenario } 
        };
      }),

      removeScenario: (id) => set((state) => {
        const newScenarios = { ...state.scenarios };
        delete newScenarios[id];
        const currentScenarioId = state.currentScenarioId === id ? null : state.currentScenarioId;
        return { scenarios: newScenarios, currentScenarioId };
      }),

      exportScenario: (id) => {
        const scenario = get().scenarios[id];
        return scenario ? { ...scenario } : null;
      },

      importScenario: (scenario) => {
        try {
          const now = Date.now();
          const scenarioWithMeta = {
            ...scenario,
            updatedAt: now
          };
          
          set((state) => {
            const newState = {
              scenarios: { ...state.scenarios, [scenario.id]: scenarioWithMeta },
              currentScenarioId: scenario.id,
            };
            
            // Synchronizuj do aktywnego scenariusza
            useScenarioStore.getState().importFromJson(scenario);
            
            return newState;
          });
          
          // Po pewnym czasie, synchronizuj z powrotem
          // używając właściwej metody z właściwego store
          setTimeout(() => {
            useScenariosMultiStore.getState().syncActiveScenarioToCurrent();
          }, 200);
          
          return scenario.id;
        } catch (error) {
          console.error("Błąd podczas importowania scenariusza:", error);
          return null;
        }
      },

      syncCurrentScenarioToActive: () => {
        const { currentScenarioId, scenarios } = get();
        if (currentScenarioId && scenarios[currentScenarioId]) {
          const scenarioData = scenarios[currentScenarioId];
          // Use the importFromJson function from scenarioStore to load the data
          useScenarioStore.getState().importFromJson(scenarioData);
          return true;
        }
        return false;
      },

      syncActiveScenarioToCurrent: () => {
        const { currentScenarioId, scenarios } = get();
        if (!currentScenarioId || !scenarios[currentScenarioId]) return;
      
        const activeScenario = useScenarioStore.getState();
        const currentScenario = scenarios[currentScenarioId];
        
        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [currentScenarioId]: {
              ...currentScenario,
              nodes: { ...activeScenario.nodes },
              edges: [...activeScenario.edges],
              categories: [...activeScenario.categories],
              nodeResponses: { ...activeScenario.nodeResponses },
              // Preserve workspace connection
              workspaceId: currentScenario.workspaceId,
              workspaceContext: currentScenario.workspaceContext,
              updatedAt: Date.now()
            }
          }
        }));
      },

      updateScenarioWorkspaceContext: (id, workspaceContext) => set((state) => {
        const scenario = state.scenarios[id];
        if (!scenario) return state;
        
        return {
          scenarios: {
            ...state.scenarios,
            [id]: {
              ...scenario,
              workspaceContext,
              updatedAt: Date.now()
            }
          }
        };
      })
    }),
    {
      name: 'scenarios-multi-storage',
      // Only persist essential data
      partialize: (state) => ({
        scenarios: state.scenarios,
        currentScenarioId: state.currentScenarioId
      })
    }
  )
);