import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  ElementType,
  GraphNode,
  GraphEdge,
  Workspace,
  Scenario,
  AppState,
} from "./types";
import { initialState } from "./initialState";

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    items: initialState.items,
    selected: initialState.selected,
    stateVersion: 0,
    conversation: [],

    // Workspace actions
    selectWorkspace: (workspaceId) =>
      set((state) => {
        state.selected.workspace = workspaceId;
        const workspace = state.items.find((w) => w.id === workspaceId);

        if ((workspace?.children ?? []).length > 0) {
          state.selected.scenario = workspace?.children?.[0]?.id || "";
        } else {
          state.selected.scenario = "";
        }
        
        // Clear node/edge selection
        state.selected.node = undefined;
        state.selected.edge = undefined;
        
        state.stateVersion++;
      }),

    addWorkspace: (payload) =>
      set((state) => {
        const newWorkspace: Workspace = {
          id: `workspace-${Date.now()}`,
          type: ElementType.WORKSPACE,
          title: payload.title,
          children: [],
        };
        state.items.push(newWorkspace);
        state.selected.workspace = newWorkspace.id;
        state.selected.scenario = "";
        
        // Clear node/edge selection
        state.selected.node = undefined;
        state.selected.edge = undefined;
        
        state.stateVersion++;
      }),

    deleteWorkspace: (workspaceId) =>
      set((state) => {
        const index = state.items.findIndex((w) => w.id === workspaceId);
        if (index !== -1) {
          state.items.splice(index, 1);

          if (workspaceId === state.selected.workspace) {
            if (state.items.length > 0) {
              state.selected.workspace = state.items[0].id;
              state.selected.scenario = state.items[0]?.children?.[0]?.id || "";
            } else {
              state.selected.workspace = "";
              state.selected.scenario = "";
            }
            
            // Clear node/edge selection
            state.selected.node = undefined;
            state.selected.edge = undefined;
          }
          state.stateVersion++;
        }
      }),

    // Scenario actions
    selectScenario: (scenarioId) =>
      set((state) => {
        state.selected.scenario = scenarioId;
        
        // Clear node/edge selection
        state.selected.node = undefined;
        state.selected.edge = undefined;
        
        state.stateVersion++;
      }),

    addScenario: (payload) =>
      set((state) => {
        const newScenario: Scenario = {
          id: `scenario-${Date.now()}`,
          type: ElementType.SCENARIO,
          name: payload.name,
          description: payload.description,
          children: [],
          edges: [],
        };

        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        if (workspace) {
          if (!workspace.children) {
            workspace.children = [];
          }
          workspace.children.push(newScenario);
          state.selected.scenario = newScenario.id;
          
          // Clear node/edge selection
          state.selected.node = undefined;
          state.selected.edge = undefined;
          
          state.stateVersion++;
        }
      }),

    deleteScenario: (scenarioId) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        if (workspace?.children) {
          const index = workspace.children.findIndex(
            (s) => s.id === scenarioId
          );
          if (index !== -1) {
            workspace.children.splice(index, 1);

            if (scenarioId === state.selected.scenario) {
              if (workspace.children.length > 0) {
                state.selected.scenario = workspace.children[0].id;
              } else {
                state.selected.scenario = "";
              }
              
              // Clear node/edge selection
              state.selected.node = undefined;
              state.selected.edge = undefined;
            }
            state.stateVersion++;
          }
        }
      }),

    // Node actions
    addNode: (payload) =>
      set((state) => {
        const newNode: GraphNode = {
          id: `node-${Date.now()}`,
          type: ElementType.GRAPH_NODE,
          label: payload.label,
          assistant: payload.assistant,
          position: payload.position || { x: 100, y: 100 },
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

    deleteNode: (nodeId) =>
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
                (edge: GraphEdge) =>
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

    updateNodePosition: (nodeId, position) =>
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
      
    setUserMessage: (nodeId, message) =>
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
      
    // Selection methods
    selectNode: (nodeId) =>
      set((state) => {
        state.selected.node = nodeId;
        state.selected.edge = undefined; // Clear edge selection
        state.stateVersion++;
      }),

    // Edge actions
    addEdge: (payload) =>
      set((state) => {
        const newEdge: GraphEdge = {
          id: `edge-${Date.now()}`,
          source: payload.source,
          target: payload.target,
          label: payload.label,
        };

        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children?.find(
          (s) => s.id === state.selected.scenario
        );

        if (scenario) {
          if (!scenario.edges) {
            scenario.edges = [];
          }
          scenario.edges.push(newEdge);
          
          // Select the newly created edge
          state.selected.edge = newEdge.id;
          state.selected.node = undefined;
          
          state.stateVersion++;
        }
      }),

    deleteEdge: (edgeId) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children?.find(
          (s) => s.id === state.selected.scenario
        );

        if (scenario?.edges) {
          const index = scenario.edges.findIndex((e) => e.id === edgeId);
          if (index !== -1) {
            scenario.edges.splice(index, 1);
            
            // Clear selection if the deleted edge was selected
            if (state.selected.edge === edgeId) {
              state.selected.edge = undefined;
            }
            
            state.stateVersion++;
          }
        }
      }),
      
    selectEdge: (edgeId) =>
      set((state) => {
        state.selected.edge = edgeId;
        state.selected.node = undefined; // Clear node selection
        state.stateVersion++;
      }),
      
    clearSelection: () =>
      set((state) => {
        state.selected.node = undefined;
        state.selected.edge = undefined;
        state.stateVersion++;
      }),
      
    // Conversation methods
    addToConversation: (payload) =>
      set((state) => {
        state.conversation.push({
          role: payload.role,
          message: payload.message
        });
        state.stateVersion++;
      }),
      
    clearConversation: () =>
      set((state) => {
        state.conversation = [];
        state.stateVersion++;
      }),

    // Helper methods
    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (!workspace) return null;
      return (
        workspace.children?.find((s) => s.id === state.selected.scenario) ||
        null
      );
    },

    getActiveScenarioData: () => {
      const state = get();
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (!workspace) return { nodes: [], edges: [] };

      const scenario = workspace.children?.find(
        (s) => s.id === state.selected.scenario
      );
      if (!scenario) return { nodes: [], edges: [] };

      const nodes =
        scenario.children?.map((node) => ({
          id: node.id,
          data: { label: `${node.label}\n${node.assistant ? '(Assistant)' : ''}` },
          position: node.position,
          selected: node.id === state.selected.node,
        })) || [];

      const edges =
        scenario.edges?.map((edge) => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.label,
          selected: edge.id === state.selected.edge,
          style: edge.id === state.selected.edge ? { stroke: '#3b82f6', strokeWidth: 3 } : {},
          className: edge.id === state.selected.edge ? 'selected-edge' : '',
          animated: edge.id === state.selected.edge,
        })) || [];

      return { nodes, edges };
    },
  }))
);