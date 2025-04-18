// src/hooks/useWorkspaceStore.ts
import { create } from 'zustand';
import type { StoreWorkspace, Scenario } from '@/types';
import { useContextStore } from './useContextStore';


interface WorkspaceState {
  workspaces: StoreWorkspace[];
  currentWorkspaceId: string | null;
  currentScenarioId: string | null;
  setInitialWorkspaces: (workspaces: StoreWorkspace[]) => void;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  getCurrentWorkspace: () => StoreWorkspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  currentScenarioId: null,

  setInitialWorkspaces: (workspaces) => {
    set({ workspaces });

    // Inicjalizacja kontekstów dla każdego workspace
    const contexts: Record<string, any> = {};
    workspaces.forEach(ws => {
      contexts[ws.id] = ws.getInitialContext
        ? JSON.parse(JSON.stringify(ws.getInitialContext()))
        : {};
    });
    useContextStore.getState().setContexts(contexts);

    // Wybór domyślnego workspace (pierwszy na liście)
    if (workspaces.length > 0) {
      set({ currentWorkspaceId: workspaces[0].id, currentScenarioId: null });
    }
  },

  selectWorkspace: (id) => {
    set({ currentWorkspaceId: id, currentScenarioId: null });
  },
  selectScenario: (id) => {
    set({ currentScenarioId: id });
  },

  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },

  getCurrentScenario: () => {
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios.find((s:Scenario) => s.id === get().currentScenarioId);
  },
}));
