// src/modules/workspaces/workspaceActions.ts
import { ElementType, Workspace, AppState } from "../types";
import { Draft } from "immer";

// The set function from immer middleware takes a function that modifies the draft state
type SetFn = (fn: (state: Draft<AppState>) => void) => void;

// Helper function to create a slug from a title
const createSlug = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .trim();
};

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
        slug: createSlug(payload.title), // Generate slug from title
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

  updateWorkspace: (workspaceId: string, payload: Partial<Workspace>) =>
    set((state: Draft<AppState>) => {
      const workspace = state.items.find((w) => w.id === workspaceId);
      
      if (workspace) {
        // If title is being updated, also update the slug
        if (payload.title && payload.title !== workspace.title) {
          payload.slug = createSlug(payload.title);
        }
        
        Object.assign(workspace, {
          ...payload,
          updatedAt: Date.now()
        });
        
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