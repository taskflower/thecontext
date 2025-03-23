import { StateCreator } from "zustand";
import { FlowActions } from "../graph/types";
import { AppState } from "../store";

export const createFlowSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  FlowActions
> = (set, get) => ({
  getActiveScenarioData: () => {
    const state = get() as AppState;
    const workspace = state.items.find(
      (w) => w.id === state.selected.workspace
    );
    if (!workspace) return { nodes: [], edges: [] };

    const scenario = workspace.children.find(
      (s) => s.id === state.selected.scenario
    );
    if (!scenario) return { nodes: [], edges: [] };

    const nodes = scenario.children.map((node) => ({
      id: node.id,
      data: {
        label: node.label,
        nodeId: node.id,
        prompt: node.userPrompt,
        message: node.assistantMessage,
        pluginKey: node.pluginKey
      },
      position: node.position,
      selected: node.id === state.selected.node,
    }));

    const edges =
      scenario.edges?.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })) || [];

    return { nodes, edges };
  },
});