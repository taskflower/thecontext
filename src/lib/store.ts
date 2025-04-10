// src/lib/store.ts
import { create } from 'zustand';
import { Scenario, TemplateSettings } from '../views/types';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext: Record<string, any>;
}

interface AppState {
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentScenarioId: string | null;
  
  setInitialWorkspaces: (workspaces: Workspace[]) => void;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  currentScenarioId: null,
  setInitialWorkspaces: (workspaces) => set({ workspaces }),
  selectWorkspace: (id) => set({ currentWorkspaceId: id }),
  selectScenario: (id) => set({ currentScenarioId: id }),
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },
  getCurrentScenario: () => {
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios.find(s => s.id === get().currentScenarioId);
  }
}));
