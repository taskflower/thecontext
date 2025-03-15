// 1. src/store/workspaceStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ElementType, Workspace } from '../types';
import { initialState } from '../initialState';

export interface WorkspaceState {
  items: Workspace[];
  selected: { workspace: string; scenario: string };
  stateVersion: number;
  
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  immer((set) => ({
    items: initialState.items,
    selected: initialState.selected,
    stateVersion: 0,
    
    selectWorkspace: (workspaceId) => set(state => {
      state.selected.workspace = workspaceId;
      const workspace = state.items.find(w => w.id === workspaceId);
      
      if ((workspace?.children ?? []).length > 0) {
        state.selected.scenario = workspace?.children?.[0]?.id || '';
      } else {
        state.selected.scenario = '';
      }
      state.stateVersion++;
    }),
    
    addWorkspace: (payload) => set(state => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`, 
        type: ElementType.WORKSPACE,
        title: payload.title, 
        children: []
      };
      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.selected.scenario = '';
      state.stateVersion++;
    }),
    
    deleteWorkspace: (workspaceId) => set(state => {
      const index = state.items.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        state.items.splice(index, 1);
        
        if (workspaceId === state.selected.workspace) {
          if (state.items.length > 0) {
            state.selected.workspace = state.items[0].id;
            state.selected.scenario = state.items[0]?.children?.[0]?.id || '';
          } else {
            state.selected.workspace = '';
            state.selected.scenario = '';
          }
        }
        state.stateVersion++;
      }
    }),
  }))
);