// src/lib/store.ts
import { create } from "zustand";
import { NodeData, Scenario } from "../../raw_modules/nodes-module/src";

interface AppState {
  workspaces: {
    id: string;
    name: string;
    scenarios: Scenario[];
  }[];
  selectedWorkspace?: string;
  selectedScenario?: string;
  currentNodeIndex: number;
}

interface AppActions {
  selectWorkspace: (workspaceId: string) => void;
  selectScenario: (scenarioId: string) => void;
  createWorkspace: (name: string) => void;
  createScenario: (workspaceId: string, scenario: Partial<Scenario>) => void;
  addNodeToScenario: (scenarioId: string, node: NodeData) => void;
  nextNode: () => void;
  prevNode: () => void;
}

const createInitialWorkspace = () => {
  const initialNode: NodeData = {
    id: "node-1",
    scenarioId: "scenario-1",
    label: "Welcome",
    assistantMessage: "Hello! What is your name?",
    contextKey: "userName",
  };
  const secondNode: NodeData = {
    id: "node-2",
    scenarioId: "scenario-1",
    label: "CHA",
    assistantMessage: "Hello! What is your name?",
    contextKey: "userName",
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

  createWorkspace: (name) =>
    set((state) => ({
      workspaces: [
        ...state.workspaces,
        {
          id: `workspace-${Date.now()}`,
          name,
          scenarios: [],
        },
      ],
    })),

  createScenario: (workspaceId, scenario) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) =>
        workspace.id === workspaceId
          ? {
              ...workspace,
              scenarios: [
                ...workspace.scenarios,
                {
                  id: `scenario-${Date.now()}`,
                  name: scenario.name || "Nowy scenariusz",
                  description: scenario.description || "",
                  nodes: scenario.nodes || [],
                },
              ],
            }
          : workspace
      ),
    })),

  addNodeToScenario: (scenarioId, node) =>
    set((state) => ({
      workspaces: state.workspaces.map((workspace) => ({
        ...workspace,
        scenarios: workspace.scenarios.map((scenario) =>
          scenario.id === scenarioId
            ? {
                ...scenario,
                nodes: [...scenario.nodes, node],
              }
            : scenario
        ),
      })),
    })),

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
}));
