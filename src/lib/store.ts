// src/lib/store.ts
import { create } from 'zustand';
import { TemplateSettings, Scenario, NodeData } from '../types';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  scenarios: Scenario[];
  templateSettings: TemplateSettings;
  initialContext: Record<string, any>;
}

interface AppState {
  // Stan aplikacji
  workspaces: Workspace[];
  currentWorkspaceId: string | null;
  currentScenarioId: string | null;
  
  // Akcje
  setInitialWorkspaces: (workspaces: Workspace[]) => void;
  selectWorkspace: (id: string) => void;
  selectScenario: (id: string) => void;
  
  // Gettery
  getCurrentWorkspace: () => Workspace | undefined;
  getCurrentScenario: () => Scenario | undefined;
}

export const useAppStore = create<AppState>((set, get) => ({
  workspaces: [],
  currentWorkspaceId: null,
  currentScenarioId: null,
  
  // Ustawia początkową listę workspaces
  setInitialWorkspaces: (workspaces) => set({ workspaces }),
  
  // Wybiera aktywny workspace
  selectWorkspace: (id) => set({ currentWorkspaceId: id }),
  
  // Wybiera aktywny scenariusz
  selectScenario: (id) => set({ currentScenarioId: id }),
  
  // Zwraca aktualny workspace
  getCurrentWorkspace: () => {
    const { workspaces, currentWorkspaceId } = get();
    return workspaces.find(w => w.id === currentWorkspaceId);
  },
  
  // Zwraca aktualny scenariusz
  getCurrentScenario: () => {
    const { currentScenarioId } = get();
    const workspace = get().getCurrentWorkspace();
    if (!workspace) return undefined;
    return workspace.scenarios.find(s => s.id === currentScenarioId);
  }
}));