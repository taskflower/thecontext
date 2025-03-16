// src/modules/edges/edgeActions.ts
import { GraphEdge } from "../types";

export const createEdgeActions = (set, get) => ({
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
});