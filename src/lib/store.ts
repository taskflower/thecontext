// src/lib/store.ts
import { create } from "zustand";
import { NodeData, Scenario } from "../../raw_modules/revertcontext-nodes-module/src";

export interface TemplateSettings {
  layoutTemplate: string;
  scenarioWidgetTemplate: string;
  defaultFlowStepTemplate: string;
}

export interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
}

interface AppState {
  workspaces: Workspace[];
  selectedWorkspace?: string;
  selectedScenario?: string;
  currentNodeIndex: number;
}

interface AppActions {
  // Akcja do inicjalizacji danych z szablonów
  setInitialWorkspaces: (workspaces: Workspace[]) => void;
  
  // Pozostałe akcje
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  nextNode: () => void;
  prevNode: () => void;
  setNodeIndex: (index: number) => void;
  updateScenarioSystemMessage: (workspaceId: string, scenarioId: string, systemMessage: string) => void;
  updateNodeIncludeSystemMessage: (workspaceId: string, scenarioId: string, nodeId: string, includeSystemMessage: boolean) => void;
}

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  // Stan początkowy - pusta lista workspaces
  workspaces: [],
  selectedWorkspace: undefined,
  selectedScenario: undefined,
  currentNodeIndex: 0,

  // Akcja do inicjalizacji workspaces z danych szablonów
  setInitialWorkspaces: (workspaces) => {
    set({ 
      workspaces,
      // Automatycznie wybierz pierwszy workspace i scenariusz, jeśli są dostępne
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
  
  // Aktualizacja wiadomości systemowej dla scenariusza
  updateScenarioSystemMessage: (workspaceId, scenarioId, systemMessage) => {
    set((state) => {
      const newWorkspaces = [...state.workspaces];
      const workspaceIndex = newWorkspaces.findIndex(w => w.id === workspaceId);
      
      if (workspaceIndex !== -1) {
        const workspace = newWorkspaces[workspaceIndex];
        const scenarioIndex = workspace.scenarios.findIndex(s => s.id === scenarioId);
        
        if (scenarioIndex !== -1) {
          // Tworzymy nową kopię scenariusza z zaktualizowaną wiadomością systemową
          const updatedScenario = {
            ...workspace.scenarios[scenarioIndex],
            systemMessage
          };
          
          // Aktualizujemy scenariusz w tablicy
          const updatedScenarios = [...workspace.scenarios];
          updatedScenarios[scenarioIndex] = updatedScenario;
          
          // Aktualizujemy workspace
          newWorkspaces[workspaceIndex] = {
            ...workspace,
            scenarios: updatedScenarios
          };
        }
      }
      
      return { workspaces: newWorkspaces };
    });
  },
  
  // Aktualizacja flagi includeSystemMessage dla węzła
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
            // Tworzymy nową kopię węzła z zaktualizowaną flagą
            const updatedNode = {
              ...scenario.nodes[nodeIndex],
              includeSystemMessage
            };
            
            // Aktualizujemy węzeł w tablicy
            const updatedNodes = [...scenario.nodes];
            updatedNodes[nodeIndex] = updatedNode;
            
            // Aktualizujemy scenariusz
            const updatedScenario = {
              ...scenario,
              nodes: updatedNodes
            };
            
            // Aktualizujemy tablicę scenariuszy
            const updatedScenarios = [...workspace.scenarios];
            updatedScenarios[scenarioIndex] = updatedScenario;
            
            // Aktualizujemy workspace
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