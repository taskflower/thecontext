// src/modules/workspaces/workspaceActions.ts
import { ElementType, Workspace, AppState } from "../types";
import { Draft } from "immer";

// The set function from immer middleware takes a function that modifies the draft state
type SetFn = (fn: (state: Draft<AppState>) => void) => void;

export const createWorkspaceActions = (set: SetFn) => ({
  selectWorkspace: (workspaceId: string) =>
    set((state: Draft<AppState>) => {
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

    addWorkspace: (payload: { title: string }) =>
      set((state: Draft<AppState>) => {
        const newWorkspace: Workspace = {
          id: `workspace-${Date.now()}`,
          type: ElementType.WORKSPACE,
          title: payload.title,
          children: [],
          contextItems: [], // Initialize empty contextItems array
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        
        state.items.push(newWorkspace);
        state.selected.workspace = newWorkspace.id;
        state.selected.scenario = "";
        
        // Clear node/edge selection
        state.selected.node = undefined;
        state.selected.edge = undefined;
        
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
});