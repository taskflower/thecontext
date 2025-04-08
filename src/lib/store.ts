// src/lib/store.ts
import { create } from "zustand";
import { NodeData, Scenario } from "../../raw_modules/nodes-module/src";

// Definicja typu Workspace
interface Workspace {
  id: string;
  name: string;
  scenarios: Scenario[];
  templateSettings: {
    layoutTemplate: string;
    scenarioWidgetTemplate: string;
    defaultFlowStepTemplate: string;
  }
}

interface AppState {
  workspaces: Workspace[];
  selectedWorkspace?: string;
  selectedScenario?: string;
  currentNodeIndex: number;
}

interface AppActions {
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  nextNode: () => void;
  prevNode: () => void;
  setNodeIndex: (index: number) => void;
}

// Tworzenie domyślnego workspace z ustawieniami szablonów
const createInitialWorkspace = (): Workspace => {
  const initialNode: NodeData = {
    id: "node-1",
    scenarioId: "scenario-1",
    label: "Welcome",
    assistantMessage: "Hello! What is your name?",
    contextKey: "userName",
    templateId: "basic-step"
  };
  
  const secondNode: NodeData = {
    id: "node-2",
    scenarioId: "scenario-1",
    label: "Greeting",
    assistantMessage: "Nice to meet you, {{userName}}! How can I help you today?",
    contextKey: "userRequest",
    templateId: "llm-query"
  };

  const initialScenario: Scenario = {
    id: "scenario-1",
    name: "First Scenario",
    description: "A simple introduction scenario",
    nodes: [initialNode, secondNode],
  };

  return {
    id: "workspace-1",
    name: "My First Workspace",
    scenarios: [initialScenario],
    templateSettings: {
      layoutTemplate: "default",
      scenarioWidgetTemplate: "card-list",
      defaultFlowStepTemplate: "basic-step"
    }
  };
};

export const useAppStore = create<AppState & AppActions>((set, get) => ({
  workspaces: [createInitialWorkspace()],
  selectedWorkspace: "workspace-1",
  selectedScenario: "scenario-1",
  currentNodeIndex: 0,

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
}));