/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { Workspace, WorkspaceActions, WorkspacePayload } from "./types";
import { AppState, TYPES } from "../store";

export const createWorkspaceSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  WorkspaceActions
> = (set, get) => ({
  selectWorkspace: (workspaceId: string) =>
    set((state: Draft<AppState>) => {
      state.selected.workspace = workspaceId;
      
      // Find the selected workspace
      const workspace = state.items.find((w) => w.id === workspaceId);
      
      // If workspace exists and has scenarios, select the first one
      if (workspace && workspace.children && workspace.children.length > 0) {
        state.selected.scenario = workspace.children[0].id;
      } else {
        state.selected.scenario = "";
      }
      
      state.selected.node = "";
      state.stateVersion++;
    }),

  addWorkspace: (payload: WorkspacePayload) =>
    set((state: Draft<AppState>) => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`,
        type: TYPES.WORKSPACE,
        title: payload.title,
        description: payload.description,
        slug: payload.slug || "",
        children: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.selected.scenario = "";
      state.selected.node = "";
      state.stateVersion++;
    }),

  updateWorkspace: (workspaceId: string, payload: WorkspacePayload) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find((w) => w.id === workspaceId);
      if (workspace) {
        workspace.title = payload.title;
        workspace.description = payload.description;
        workspace.slug = payload.slug || "";
        workspace.updatedAt = Date.now();
        state.stateVersion++;
      }
    }),

  deleteWorkspace: (workspaceId: string) =>
    set((state: Draft<AppState>) => {
      const index = state.items.findIndex((w) => w.id === workspaceId);
      if (index !== -1) {
        state.items.splice(index, 1);

        if (workspaceId === state.selected.workspace) {
          if (state.items.length > 0) {
            state.selected.workspace = state.items[0].id;
          } else {
            state.selected.workspace = "";
          }
          state.selected.scenario = "";
          state.selected.node = "";
        }
        state.stateVersion++;
      }
    }),

  getCurrentWorkspace: () => {
    const state = get();
    return state.items.find((w) => w.id === state.selected.workspace) || null;
  },
});