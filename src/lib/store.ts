// src/lib/store.ts
import { create } from "zustand";
import { NodeData } from "../../raw_modules/revertcontext-nodes-module/src/types/NodeTypes";

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
  showContextWidget?: boolean;
}

// Interface for a scenario
export interface Scenario {
  id: string;
  name: string;
  description: string;
  nodes: NodeData[];
  systemMessage?: string;
  edges?: any[];
}

export interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext?: Record<string, any>; // Change from contextItems to initialContext
}

interface AppState {
  workspaces: Workspace[];
  selectedWorkspace?: string;
  selectedScenario?: string;
  currentNodeIndex: number;
}

interface AppActions {
  // Action to initialize workspaces from templates
  setInitialWorkspaces: (workspaces: Workspace[]) => void;
  
  // Other actions
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  nextNode: () => void;
  prevNode: () => void;
  setNodeIndex: (index: number) => void;
  updateScenarioSystemMessage: (workspaceId: string, scenarioId: string, systemMessage: string) => void;
  updateNodeIncludeSystemMessage: (workspaceId: string, scenarioId: string, nodeId: string, includeSystemMessage: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Initial state - empty workspaces list
  workspaces: [],
  selectedWorkspace: undefined,
  selectedScenario: undefined,
  currentNodeIndex: 0,

  // Action to initialize workspaces from template data
  setInitialWorkspaces: (workspaces) => {
    set({ 
      workspaces,
      // Automatically select first workspace and scenario if available
      selectedWorkspace: workspaces.length > 0 ? workspaces[0].id : undefined,
      selectedScenario: workspaces.length > 0 && workspaces[0].scenarios.length > 0 
        ? workspaces[0].scenarios[0].id 
        : undefined
    });
  },
  
  selectWorkspace: (workspaceId) =>
    set({
      selectedWorkspace: workspaceId,
      selectedScenario: undefined,
      currentNodeIndex: 0,
    }),

  selectScenario: (scenarioId) =>
    set({
      selectedScenario: scenarioId,
      currentNodeIndex: 0,
    }),

  nextNode: () => {
    const { selectedScenario, workspaces, currentNodeIndex } = get();
    const scenario = workspaces
      .flatMap((w) => w.scenarios)
      .find((s) => s.id === selectedScenario);

    if (scenario && currentNodeIndex < scenario.nodes.length - 1) {
      set((state) => ({ currentNodeIndex: state.currentNodeIndex + 1 }));
    }
  },

  prevNode: () => {
    const { currentNodeIndex } = get();
    if (currentNodeIndex > 0) {
      set((state) => ({ currentNodeIndex: state.currentNodeIndex - 1 }));
    }
  },
  
  setNodeIndex: (index) => {
    set({ currentNodeIndex: index });
  },
  
  // Update system message for a scenario
  updateScenarioSystemMessage: (workspaceId, scenarioId, systemMessage) => {
    set((state) => {
      const newWorkspaces = [...state.workspaces];
      const workspaceIndex = newWorkspaces.findIndex(w => w.id === workspaceId);
      
      if (workspaceIndex !== -1) {
        const workspace = newWorkspaces[workspaceIndex];
        const scenarioIndex = workspace.scenarios.findIndex(s => s.id === scenarioId);
        
        if (scenarioIndex !== -1) {
          // Create a new copy of the scenario with updated system message
          const updatedScenario = {
            ...workspace.scenarios[scenarioIndex],
            systemMessage
          };
          
          // Update scenario in the array
          const updatedScenarios = [...workspace.scenarios];
          updatedScenarios[scenarioIndex] = updatedScenario;
          
          // Update workspace
          newWorkspaces[workspaceIndex] = {
            ...workspace,
            scenarios: updatedScenarios
          };
        }
      }
      
      return { workspaces: newWorkspaces };
    });
  },
  
  // Update includeSystemMessage flag for a node
  updateNodeIncludeSystemMessage: (workspaceId, scenarioId, nodeId, includeSystemMessage) => {
    set((state) => {
      const newWorkspaces = [...state.workspaces];
      const workspaceIndex = newWorkspaces.findIndex(w => w.id === workspaceId);
      
      if (workspaceIndex !== -1) {
        const workspace = newWorkspaces[workspaceIndex];
        const scenarioIndex = workspace.scenarios.findIndex(s => s.id === scenarioId);
        
        if (scenarioIndex !== -1) {
          const scenario = workspace.scenarios[scenarioIndex];
          const nodeIndex = scenario.nodes.findIndex(n => n.id === nodeId);
          
          if (nodeIndex !== -1) {
            // Create a new copy of the node with updated flag
            const updatedNode = {
              ...scenario.nodes[nodeIndex],
              includeSystemMessage
            };
            
            // Update node in the array
            const updatedNodes = [...scenario.nodes];
            updatedNodes[nodeIndex] = updatedNode;
            
            // Update scenario
            const updatedScenario = {
              ...scenario,
              nodes: updatedNodes
            };
            
            // Update scenarios array
            const updatedScenarios = [...workspace.scenarios];
            updatedScenarios[scenarioIndex] = updatedScenario;
            
            // Update workspace
            newWorkspaces[workspaceIndex] = {
              ...workspace,
              scenarios: updatedScenarios
            };
          }
        }
      }
      
      return { workspaces: newWorkspaces };
    });
  }
}));