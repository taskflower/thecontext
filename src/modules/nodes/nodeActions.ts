// src/modules/nodes/nodeActions.ts
import { PluginOptions } from "../plugin/types";
import { ElementType, GraphNode, Position } from "../types";
import { SetFn } from "../typesActioss";

export const createNodeActions = (set: SetFn) => ({
  addNode: (payload: { label: string; assistant: string; position?: Position, plugin?: string }) =>
    set((state) => {
      const newNode: GraphNode = {
        id: `node-${Date.now()}`,
        type: ElementType.GRAPH_NODE,
        label: payload.label,
        assistant: payload.assistant,
        position: payload.position || { x: 100, y: 100 },
        plugin: payload.plugin,
      };

      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children?.find(
        (s) => s.id === state.selected.scenario
      );

      if (scenario) {
        if (!scenario.children) {
          scenario.children = [];
        }
        scenario.children.push(newNode);
        
        // Select the newly created node
        state.selected.node = newNode.id;
        state.selected.edge = undefined;
        
        state.stateVersion++;
      }
    }),

  deleteNode: (nodeId: string) =>
    set((state) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children?.find(
        (s) => s.id === state.selected.scenario
      );

      if (scenario?.children) {
        const index = scenario.children.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);

          if (!scenario.edges) {
            scenario.edges = [];
          } else {
            // Remove related edges
            scenario.edges = scenario.edges.filter(
              (edge) =>
                edge.source !== nodeId && edge.target !== nodeId
            );
          }
          
          // Clear selection if the deleted node was selected
          if (state.selected.node === nodeId) {
            state.selected.node = undefined;
          }
          
          state.stateVersion++;
        }
      }
    }),
    updateNodeData: (nodeId: string, label: string, assistant: string, pluginOptions?: { [pluginId: string]: PluginOptions }) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children?.find(
          (s) => s.id === state.selected.scenario
        );
        const node = scenario?.children?.find((n) => n.id === nodeId);
    
        if (node) {
          node.label = label;
          node.assistant = assistant;
          if (pluginOptions) {
            node.pluginOptions = pluginOptions;
          }
          state.stateVersion++;
        }
      }),

  updateNodePosition: (nodeId: string, position: Position) =>
    set((state) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children?.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children?.find((n) => n.id === nodeId);

      if (node) {
        node.position = position;
        state.stateVersion++;
      }
    }),
    
  updateNodePlugin: (nodeId: string, plugin: string | undefined) =>
    set((state) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children?.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children?.find((n) => n.id === nodeId);

      if (node) {
        node.plugin = plugin;
        state.stateVersion++;
      }
    }),
    
  setUserMessage: (nodeId: string, message: string) =>
    set((state) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      const scenario = workspace?.children?.find(
        (s) => s.id === state.selected.scenario
      );
      const node = scenario?.children?.find((n) => n.id === nodeId);

      if (node) {
        node.userMessage = message;
        state.stateVersion++;
      }
    }),
    
  selectNode: (nodeId: string) =>
    set((state) => {
      state.selected.node = nodeId;
      state.selected.edge = undefined; // Clear edge selection
      state.stateVersion++;
    }),
});