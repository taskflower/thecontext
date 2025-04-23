// src/hooks/useWorkspaceStore.ts
import { create } from 'zustand';
import type { Workspace, Scenario } from '@/types';
import { useContextStore } from './useContextStore';
import { firebaseService } from '@/_firebase/firebase';

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

  // Pobierz wszystkie workspaces z Firebase
  fetchWorkspaces: async () => {
    try {
      set({ isLoading: true, error: null });
      const workspaces = await firebaseService.getWorkspaces();
      
      // Inicjalizacja kontekstów dla każdego workspace
      const contexts: Record<string, any> = {};
      workspaces.forEach(ws => {
        contexts[ws.id] = ws.initialContext || {};
      });
      useContextStore.getState().setContexts(contexts);
      
      set({ workspaces, isLoading: false });
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch workspaces', 
        isLoading: false 
      });
    }
  },

  // Pobierz konkretny workspace po ID
  fetchWorkspaceById: async (id: string) => {
    try {
      set({ isLoading: true, error: null });
      const workspace = await firebaseService.getWorkspaceById(id);
      
      if (!workspace) {
        throw new Error(`Workspace with ID ${id} not found`);
      }
      
      set((state) => {
        // Aktualizuj istniejące workspaces lub dodaj nowy
        const exists = state.workspaces.some(w => w.id === id);
        let updatedWorkspaces = [...state.workspaces];
        
        if (exists) {
          updatedWorkspaces = updatedWorkspaces.map(w => 
            w.id === id ? workspace : w
          );
        } else {
          updatedWorkspaces.push(workspace);
        }
        
        return { 
          workspaces: updatedWorkspaces,
          currentWorkspaceId: id,
          isLoading: false 
        };
      });
      
      // Inicjalizuj kontekst dla workspace
      const contexts = useContextStore.getState().contexts;
      if (!contexts[id]) {
        useContextStore.getState().setContexts({
          ...contexts,
          [id]: workspace.initialContext || {}
        });
      }
      
    } catch (error) {
      console.error('Error fetching workspace:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch workspace details', 
        isLoading: false 
      });
    }
  },

  // Ustaw workspaces (dla kompatybilności wstecznej)
  setWorkspaces: (workspaces) => {
    set({ workspaces });

    // Inicjalizacja kontekstów dla każdego workspace
    const contexts: Record<string, any> = {};
    workspaces.forEach(ws => {
      contexts[ws.id] = ws.initialContext || {};
    });
    useContextStore.getState().setContexts(contexts);
  },

  // Wybór workspace
  selectWorkspace: (id) => {
    set({ currentWorkspaceId: id, currentScenarioId: null });
    
    // Automatycznie ładuj workspace jeśli nie został jeszcze pobrany
    const workspace = get().workspaces.find(w => w.id === id);
    if (!workspace) {
      get().fetchWorkspaceById(id);
    }
  },
  
  // Wybór scenariusza
  selectScenario: (id) => {
    set({ currentScenarioId: id });
  },

  // Pobierz aktualny workspace
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },

  // Pobierz aktualny scenariusz
  getCurrentScenario: () => {
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios.find(s => s.id === get().currentScenarioId);
  },
  
  // Ustawienie stanu ładowania
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  // Ustawienie błędu
  setError: (error: string | null) => set({ error }),
}));