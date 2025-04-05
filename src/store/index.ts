/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Main Store
 * Unified store implementation with CRUD operations for all entity types
 */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';


// Store State Type
interface AppState {
  workspaces: any[];
  scenarios: any[];
  nodes: any[];
  edges: any[];
  contexts: any[];
  selected: {
    workspace: string;
    scenario: string;
    node: string;
  };
  version: number;
  
  // Workspace operations
  selectWorkspace: (id: string) => void;
  getCurrentWorkspace: () => any;
  
  // Scenario operations
  selectScenario: (id: string) => void;
  getCurrentScenario: () => any;
  startFlowSession: () => void;
  stopFlowSession: (save?: boolean) => void;
  
  // Flow session state
  flowSession: {
    currentStepIndex: number;
    temporarySteps: any[];
  } | null;
  nextStep: () => void;
  prevStep: () => void;
  
  // Context operations
  getContextItems: () => any[];
  
  // Node operations
  updateTempNodeUserPrompt: (nodeId: string, value: string) => void;
  updateTempNodeAssistantMessage: (nodeId: string, value: string) => void;
}

// Create the store with immer middleware for immutable updates
export const useStore = create<AppState>()(
  immer((set, get) => ({
    // Initial state
    workspaces: [],
    scenarios: [],
    nodes: [],
    edges: [],
    contexts: [],
    selected: {
      workspace: '',
      scenario: '',
      node: ''
    },
    version: 0,
    flowSession: null,
    
    // Workspace operations
    selectWorkspace: (id) => {
      set((state) => {
        state.selected.workspace = id;
        return state;
      });
    },
    
    getCurrentWorkspace: () => {
      const state = get();
      return state.workspaces.find(w => w.id === state.selected.workspace);
    },
    
    // Scenario operations
    selectScenario: (id) => {
      set((state) => {
        state.selected.scenario = id;
        return state;
      });
    },
    
    getCurrentScenario: () => {
      const state = get();
      const workspaces = state.workspaces;
      
      // Find the current workspace
      const workspace = workspaces.find(w => w.id === state.selected.workspace);
      if (!workspace) return null;
      
      // Find the current scenario in the workspace
      if (Array.isArray(workspace.scenarios)) {
        return workspace.scenarios.find(s => s.id === state.selected.scenario);
      }
      
      return null;
    },
    
    // Flow session management
    startFlowSession: () => {
      const state = get();
      const currentScenario = state.getCurrentScenario();
      
      if (!currentScenario) return;
      
      // Initialize flow session with all nodes
      set((state) => {
        state.flowSession = {
          currentStepIndex: 0,
          temporarySteps: [...(currentScenario.nodes || [])]
        };
        return state;
      });
    },
    
    stopFlowSession: (save = false) => {
      const state = get();
      
      if (save && state.flowSession) {
        // Save changes back to the scenario
        const currentScenario = state.getCurrentScenario();
        if (currentScenario) {
          const updatedNodes = state.flowSession.temporarySteps;
          
          set((state) => {
            // Find the workspace index
            const workspaceIndex = state.workspaces.findIndex(
              w => w.id === state.selected.workspace
            );
            
            if (workspaceIndex !== -1) {
              // Find the scenario index in the workspace
              const scenarioIndex = state.workspaces[workspaceIndex].scenarios.findIndex(
                s => s.id === state.selected.scenario
              );
              
              if (scenarioIndex !== -1) {
                // Update the nodes
                state.workspaces[workspaceIndex].scenarios[scenarioIndex].nodes = updatedNodes;
              }
            }
            
            return state;
          });
        }
      }
      
      // Clear the flow session
      set((state) => {
        state.flowSession = null;
        return state;
      });
    },
    
    // Navigation in flow
    nextStep: () => {
      set((state) => {
        if (state.flowSession) {
          const nextIndex = state.flowSession.currentStepIndex + 1;
          if (nextIndex < state.flowSession.temporarySteps.length) {
            state.flowSession.currentStepIndex = nextIndex;
          }
        }
        return state;
      });
    },
    
    prevStep: () => {
      set((state) => {
        if (state.flowSession) {
          const prevIndex = state.flowSession.currentStepIndex - 1;
          if (prevIndex >= 0) {
            state.flowSession.currentStepIndex = prevIndex;
          }
        }
        return state;
      });
    },
    
    // Context operations
    getContextItems: () => {
      const state = get();
      return state.contexts;
    },
    
    // Node operations in flow session
    updateTempNodeUserPrompt: (nodeId, value) => {
      set((state) => {
        if (state.flowSession) {
          const nodeIndex = state.flowSession.temporarySteps.findIndex(
            n => n.id === nodeId
          );
          
          if (nodeIndex !== -1) {
            state.flowSession.temporarySteps[nodeIndex].userPrompt = value;
          }
        }
        return state;
      });
    },
    
    updateTempNodeAssistantMessage: (nodeId, value) => {
      set((state) => {
        if (state.flowSession) {
          const nodeIndex = state.flowSession.temporarySteps.findIndex(
            n => n.id === nodeId
          );
          
          if (nodeIndex !== -1) {
            state.flowSession.temporarySteps[nodeIndex].assistantMessage = value;
          }
        }
        return state;
      });
    }
  }))
);

export default useStore;