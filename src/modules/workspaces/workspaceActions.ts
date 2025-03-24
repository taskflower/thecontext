import { StateCreator } from "zustand";
import { Draft } from "immer";
import { Workspace, WorkspaceActions } from "./types";
import { AppState, TYPES } from "../store";

export const createWorkspaceSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  WorkspaceActions
> = (set) => ({
  selectWorkspace: (workspaceId: string) =>
    set((state: Draft<AppState>) => {
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
    set((state: Draft<AppState>) => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        type: TYPES.WORKSPACE,
        title: payload.title,
        children: [],
        contextItems: [], // Dodaj puste contextItems
        createdAt: Date.now(), // Dodaj timestamp utworzenia
        updatedAt: Date.now(), // Dodaj timestamp aktualizacji
      };
      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.selected.scenario = "";
      state.selected.node = "";
      state.stateVersion++;
    }),

  deleteWorkspace: (workspaceId: string) =>
    set((state: Draft<AppState>) => {
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
});