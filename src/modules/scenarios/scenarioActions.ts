// src/modules/scenarios/scenarioActions.ts
import { ElementType, Scenario } from "../types";
import { SetFn } from "../typesActioss";

export const createScenarioActions = (set: SetFn) => ({
  selectScenario: (scenarioId: string) =>
    set((state) => {
      state.selected.scenario = scenarioId;
      
      // Clear node/edge selection
      state.selected.node = undefined;
      state.selected.edge = undefined;
      
      state.stateVersion++;
    }),

  addScenario: (payload: { name: string; description?: string }) =>
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

  deleteScenario: (scenarioId: string) =>
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
});