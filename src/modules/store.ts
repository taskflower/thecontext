import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TYPES, SelectionState } from "./common/types";
import { Workspace, WorkspaceActions } from "./workspaces/types";
import { Scenario, ScenarioActions } from "./scenarios/types";
import {
  NodeActions,
  EdgeActions,
  FlowActions,
  FlowNode,
  Edge,
} from "./graph/types";

export interface AppState
  extends WorkspaceActions,
    ScenarioActions,
    NodeActions,
    EdgeActions,
    FlowActions {
  items: Workspace[];
  selected: SelectionState;
  stateVersion: number;
}

// Create the store with all actions
export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // Initial state
    items: [
      {
        id: "workspace1",
        type: TYPES.WORKSPACE,
        title: "Project Alpha",
        children: [
          {
            id: "scenario1",
            type: TYPES.SCENARIO,
            name: "Main Flow",
            description: "Primary user journey",
            children: [
              {
                id: "node1",
                type: TYPES.NODE,
                label: "Start",
                value: 100,
                position: { x: 100, y: 100 },
              },
              {
                id: "node2",
                type: TYPES.NODE,
                label: "Process",
                value: 250,
                position: { x: 300, y: 200 },
              },
            ],
            edges: [
              {
                id: "edge1",
                type: TYPES.EDGE,
                source: "node1",
                target: "node2",
                label: "Flow",
              },
            ],
          },
        ],
      },
    ],
    selected: { workspace: "workspace1", scenario: "scenario1", node: "" },
    stateVersion: 0,

    // Workspace actions
    selectWorkspace: (workspaceId: string) =>
      set((state) => {
        state.selected.workspace = workspaceId;
        const workspace = state.items.find((w) => w.id === workspaceId);
        if (workspace?.children && workspace.children.length > 0) {
          state.selected.scenario = workspace.children[0].id;
        } else {
          state.selected.scenario = "";
        }
        state.selected.node = "";
        state.stateVersion++;
      }),

    addWorkspace: (payload: { title: string }) =>
      set((state) => {
        const newWorkspace: Workspace = {
          id: `workspace-${Date.now()}`,
          type: TYPES.WORKSPACE,
          title: payload.title,
          children: [],
        };
        state.items.push(newWorkspace);
        state.selected.workspace = newWorkspace.id;
        state.selected.scenario = "";
        state.selected.node = "";
        state.stateVersion++;
      }),

    deleteWorkspace: (workspaceId: string) =>
      set((state) => {
        const index = state.items.findIndex((w) => w.id === workspaceId);
        if (index !== -1) {
          state.items.splice(index, 1);

          if (workspaceId === state.selected.workspace) {
            if (state.items.length > 0) {
              state.selected.workspace = state.items[0].id;
              state.selected.scenario = state.items[0].children?.[0]?.id || "";
            } else {
              state.selected.workspace = "";
              state.selected.scenario = "";
            }
            state.selected.node = "";
          }
          state.stateVersion++;
        }
      }),

    // Scenario actions
    selectScenario: (scenarioId: string) =>
      set((state) => {
        state.selected.scenario = scenarioId;
        state.selected.node = "";
        state.stateVersion++;
      }),

    addScenario: (payload: { name: string; description: string }) =>
      set((state) => {
        const newScenario: Scenario = {
          id: `scenario-${Date.now()}`,
          type: TYPES.SCENARIO,
          name: payload.name,
          description: payload.description,
          children: [],
          edges: [],
        };

        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        if (workspace) {
          workspace.children.push(newScenario);
          state.selected.scenario = newScenario.id;
          state.selected.node = "";
        }
        state.stateVersion++;
      }),

    deleteScenario: (scenarioId: string) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        if (workspace) {
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
              state.selected.node = "";
            }
            state.stateVersion++;
          }
        }
      }),

    // Node actions
    selectNode: (nodeId: string) =>
      set((state) => {
        state.selected.node = nodeId;
        state.stateVersion++;
      }),

    addNode: (payload: {
      label: string;
      value: string | number;
      position?: { x: number; y: number };
    }) =>
      set((state) => {
        const newNode: FlowNode = {
          id: `node-${Date.now()}`,
          type: TYPES.NODE,
          label: payload.label,
          value: Number(payload.value),
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
      set((state) => {
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
      set((state) => {
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

    setNodePlugin: (
      nodeId: string,
      pluginKey: string | null,
      initialData?: unknown
    ) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children.find(
          (s) => s.id === state.selected.scenario
        );
        const node = scenario?.children.find((n) => n.id === nodeId);

        if (node) {
          if (pluginKey === null) {
            // Usuwamy klucz pluginu i czyścimy jego dane
            node.pluginKey = undefined;
            node.pluginData = undefined;
          } else {
            // Ustawiamy klucz pluginu
            node.pluginKey = pluginKey;

            // Inicjalizujemy dane pluginu
            if (!node.pluginData) {
              node.pluginData = {};
            }

            // Jeśli podano dane początkowe, zapisujemy je
            if (initialData !== undefined) {
              if (!node.pluginData) node.pluginData = {};
              node.pluginData[pluginKey] = initialData;
            }
          }

          state.stateVersion++;
        }
      }),

    updateNodePluginData: (nodeId: string, pluginKey: string, data: unknown) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children.find(
          (s) => s.id === state.selected.scenario
        );
        const node = scenario?.children.find((n) => n.id === nodeId);

        if (node) {
          // Inicjalizujemy obiekt danych pluginu, jeśli nie istnieje
          if (!node.pluginData) {
            node.pluginData = {};
          }

          // Aktualizujemy dane pluginu
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

    // Edge actions
    addEdge: (payload: {
      source: string;
      target: string;
      label?: string;
      type?: string;
    }) =>
      set((state) => {
        const newEdge: Edge = {
          id: `edge-${Date.now()}`,
          type: payload.type || TYPES.EDGE,
          source: payload.source,
          target: payload.target,
          label: payload.label || "",
        };

        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children.find(
          (s) => s.id === state.selected.scenario
        );
        if (scenario) {
          if (!scenario.edges) scenario.edges = [];
          scenario.edges.push(newEdge);
          state.stateVersion++;
        }
      }),

    deleteEdge: (edgeId: string) =>
      set((state) => {
        const workspace = state.items.find(
          (w) => w.id === state.selected.workspace
        );
        const scenario = workspace?.children.find(
          (s) => s.id === state.selected.scenario
        );
        if (scenario?.edges) {
          const index = scenario.edges.findIndex((e) => e.id === edgeId);
          if (index !== -1) {
            scenario.edges.splice(index, 1);
            state.stateVersion++;
          }
        }
      }),

    // Flow-related actions
    getActiveScenarioData: () => {
      const state = get();
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
          label: `${node.label} (${node.value})`,
          nodeId: node.id,
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

    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (!workspace) return null;
      return (
        workspace.children.find((s) => s.id === state.selected.scenario) || null
      );
    },
  }))
);
