// src/hooks/useWorkspaceStore.ts
import { create } from 'zustand';
import type { Workspace, Scenario } from '@/types';
import { useContextStore } from './useContextStore';
import { firebaseService } from '@/_firebase/firebase';
import { errorUtils } from '@/utils/errorUtils';
import { stateUtils } from '@/utils/stateUtils';

interface WorkspaceState {
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  currentWorkspaceId: string | null;
  currentScenarioId: string | null;
  
  // Akcje
  fetchWorkspaces: () => Promise<void>;
  fetchWorkspaceById: (id: string) => Promise<void>;
  setWorkspaces: (workspaces: Workspace[]) => void;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
  
  // Stan ładowania
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  isLoading: false,
  error: null,
  currentWorkspaceId: null,
  currentScenarioId: null,

  fetchWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      const workspaces = await firebaseService.getWorkspaces();
      
      console.log("Pobrano workspaces:", workspaces.length);
      
      const contexts: Record<string, any> = {};
      workspaces.forEach(ws => {
        contexts[ws.id] = ws.initialContext || {};
      });
      useContextStore.getState().setContexts(contexts);
      
      set({ workspaces, isLoading: false });
    } catch (error) {
      const errorMsg = errorUtils.handleError(error, 'useWorkspaceStore:fetchWorkspaces');
      set({ 
        error: errorMsg, 
        isLoading: false 
      });
    }
  },

  fetchWorkspaceById: async (id: string) => {
    if (!id) return;
    
    try {
      set({ isLoading: true, error: null });
      console.log("Pobieranie workspace o ID:", id);
      
      const workspace = await firebaseService.getWorkspaceById(id);
      
      if (!workspace) {
        throw new Error(`Workspace with ID ${id} not found`);
      }
      
      set((state) => {
        const updatedWorkspaces = stateUtils.updateItemInList(
          state.workspaces, 
          workspace
        );
        
        return { 
          workspaces: updatedWorkspaces,
          currentWorkspaceId: id,
          isLoading: false 
        };
      });
      
      const contexts = useContextStore.getState().contexts;
      if (!contexts[id]) {
        useContextStore.getState().setContexts({
          ...contexts,
          [id]: workspace.initialContext || {}
        });
      }
      
    } catch (error) {
      const errorMsg = errorUtils.handleError(error, 'useWorkspaceStore:fetchWorkspaceById');
      set({ 
        error: errorMsg, 
        isLoading: false 
      });
    }
  },

  setWorkspaces: (workspaces) => {
    set({ workspaces });

    const contexts: Record<string, any> = {};
    workspaces.forEach(ws => {
      contexts[ws.id] = ws.initialContext || {};
    });
    useContextStore.getState().setContexts(contexts);
  },

  selectWorkspace: (id) => {
    if (!id) return;
    
    console.log("Wybór workspace:", id);
    set({ currentWorkspaceId: id, currentScenarioId: null });
    
    const workspace = get().workspaces.find(w => w.id === id);
    if (!workspace || !workspace.scenarios || workspace.scenarios.length === 0) {
      console.log("Workspace nie istnieje lub jest pusty, pobieranie:", id);
      get().fetchWorkspaceById(id);
    }
  },
  
  selectScenario: (id) => {
    if (!id) return;
    set({ currentScenarioId: id });
  },

  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    if (!currentWorkspaceId) return undefined;
    return workspaces.find(w => w.id === currentWorkspaceId);
  },

  getCurrentScenario: () => {
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios?.find(s => s.id === get().currentScenarioId);
  },
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setError: (error: string | null) => set({ error }),
}));