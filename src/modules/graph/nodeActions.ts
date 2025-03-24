import { StateCreator } from "zustand";
import { Draft } from "immer";
import { NodeActions, FlowNode } from "../graph/types";
import { AppState, TYPES } from "../store";

export const createNodeSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  NodeActions
> = (set, get) => ({
  selectNode: (nodeId: string) =>
    set((state: Draft<AppState>) => {
      state.selected.node = nodeId;
      state.stateVersion++;
    }),

  addNode: (payload: {
    label: string;
    assistantMessage: string;
    userPrompt?: string;
    position?: { x: number; y: number };
  }) =>
    set((state: Draft<AppState>) => {
      const newNode: FlowNode = {
        id: `node-${Date.now()}`,
        type: TYPES.NODE,
        label: payload.label,
        assistantMessage: payload.assistantMessage,
        userPrompt: payload.userPrompt || "",
        position: payload.position || { x: 100, y: 100 },
      };

      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      if (scenario) {
        scenario.children.push(newNode);
        state.selected.node = newNode.id;
        state.stateVersion++;
      }
    }),

  deleteNode: (nodeId: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      if (scenario) {
        const index = scenario.children.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);
          // Remove connected edges
          if (scenario.edges) {
            scenario.edges = scenario.edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId
            );
          }

          if (nodeId === state.selected.node) {
            state.selected.node = "";
          }
          state.stateVersion++;
        }
      }
    }),

  updateNodePosition: (nodeId: string, position: { x: number; y: number }) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);
      if (node) {
        node.position = position;
        state.stateVersion++;
      }
    }),
    
  // New method to update node label
  updateNodeLabel: (nodeId: string, label: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);
      if (node) {
        node.label = label;
        state.stateVersion++;
      }
    }),

  // New method to update node user prompt
  updateNodeUserPrompt: (nodeId: string, prompt: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);
      if (node) {
        node.userPrompt = prompt;
        state.stateVersion++;
      }
    }),

  // New method to update node assistant message
  updateNodeAssistantMessage: (nodeId: string, message: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);
      if (node) {
        node.assistantMessage = message;
        state.stateVersion++;
      }
    }),

  setNodePlugin: (
    nodeId: string,
    pluginKey: string | null,
    initialData?: unknown
  ) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);

      if (node) {
        if (pluginKey === null) {
          // Remove plugin key and clear its data
          node.pluginKey = undefined;
          node.pluginData = undefined;
        } else {
          // Set plugin key
          node.pluginKey = pluginKey;

          // Initialize plugin data
          if (!node.pluginData) {
            node.pluginData = {};
          }

          // If initial data provided, save it
          if (initialData !== undefined) {
            if (!node.pluginData) node.pluginData = {};
            node.pluginData[pluginKey] = initialData;
          }
        }

        state.stateVersion++;
      }
    }),

  updateNodePluginData: (nodeId: string, pluginKey: string, data: unknown) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children.find((n) => n.id === nodeId);

      if (node) {
        // Initialize plugin data object if it doesn't exist
        if (!node.pluginData) {
          node.pluginData = {};
        }

        // Update plugin data
        node.pluginData[pluginKey] = data;
        state.stateVersion++;
      }
    }),
    
  getNodePluginData: (nodeId: string, pluginKey: string) => {
    const state = get();
    const workspace = state.items.find(
      (w) => w.id === state.selected.workspace
    );
    const scenario = workspace?.children.find(
      (s) => s.id === state.selected.scenario
    );
    const node = scenario?.children.find((n) => n.id === nodeId);

    if (node && node.pluginData && pluginKey in node.pluginData) {
      return node.pluginData[pluginKey];
    }

    return null;
  },
});