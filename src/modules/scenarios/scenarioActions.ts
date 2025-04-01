/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { Scenario, ScenarioActions, ScenarioPayload } from "./types";
import { AppState, TYPES } from "../store";

export const createScenarioSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  ScenarioActions
> = (set, get) => ({
  selectScenario: (scenarioId: string) =>
    set((state: Draft<AppState>) => {
      state.selected.scenario = scenarioId;
      state.selected.node = "";
      state.stateVersion++;
    }),

  addScenario: (payload: ScenarioPayload) =>
    set((state: Draft<AppState>) => {
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`,
        type: TYPES.SCENARIO,
        name: payload.name,
        description: payload.description,
        template: payload.template,
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

  updateScenario: (scenarioId: string, payload: ScenarioPayload) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (workspace) {
        const scenario = workspace.children.find((s) => s.id === scenarioId);
        if (scenario) {
          scenario.name = payload.name;
          scenario.description = payload.description;
          if (payload.template) {
            scenario.template = payload.template;
          }
          state.stateVersion++;
        }
      }
    }),

  deleteScenario: (scenarioId: string) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find(
        (w) => w.id === state.selected.workspace
      );
      if (workspace) {
        const index = workspace.children.findIndex((s) => s.id === scenarioId);
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

  getCurrentScenario: () => {
    const state = get() as any;
    const workspace = state.items.find(
      (w: any) => w.id === state.selected.workspace
    );
    if (!workspace) return null;
    return (
      workspace.children.find((s: any) => s.id === state.selected.scenario) ||
      null
    );
  },
});