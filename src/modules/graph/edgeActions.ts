import { StateCreator } from "zustand";
import { Draft } from "immer";
import { EdgeActions, Edge } from "../graph/types";
import { AppState, TYPES } from "../store";

export const createEdgeSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  EdgeActions
> = (set) => ({
  addEdge: (payload: {
    source: string;
    target: string;
    label?: string;
    type?: string;
  }) =>
    set((state: Draft<AppState>) => {
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
    set((state: Draft<AppState>) => {
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
});