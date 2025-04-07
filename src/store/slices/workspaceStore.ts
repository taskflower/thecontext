/* eslint-disable @typescript-eslint/no-explicit-any */
// store/slices/workspaceStore.ts
import { StateCreator } from 'zustand';
import { AppStore, WorkspaceState, WorkspaceActions } from '../types';

const createWorkspaceSlice: StateCreator<
  AppStore,
  [],
  [],
  WorkspaceState & WorkspaceActions
> = (set, get) => ({
  // Stan początkowy
  workspaces: [
    {
      id: 'workspace-1', 
      name: 'Podstawowy workspace', 
      scenarios: [
        {
          id: 'scenario-1', 
          name: 'Prosty scenariusz', 
          description: 'Przykładowy scenariusz',
          nodes: [
            { 
              id: 'node-1', 
              scenarioId: 'scenario-1', 
              label: 'Powitanie', 
              description: 'Pytanie o imię',
              position: { x: 100, y: 100 }, 
              assistantMessage: 'Cześć! Jak masz na imię?', 
              contextKey: 'user_name' 
            },
            { 
              id: 'node-2', 
              scenarioId: 'scenario-1', 
              label: 'Odpowiedź', 
              description: 'Powitanie użytkownika',
              position: { x: 100, y: 250 }, 
              assistantMessage: 'Miło Cię poznać, {{user_name}}!', 
              contextKey: 'user_request' 
            }
          ]
        }
      ]
    }
  ],

  // Selektory
  getWorkspace: () => {
    const { workspaces, selectedIds } = get();
    return workspaces.find(w => w.id === selectedIds.workspace);
  },
  
  getScenario: () => {
    const workspace = get().getWorkspace();
    const { selectedIds } = get();
    return workspace?.scenarios.find(s => s.id === selectedIds.scenario);
  },
  
  // Akcje
  createWorkspace: (name) => {
    if (!name.trim()) return;
    
    set(state => ({
      workspaces: [...state.workspaces, { 
        id: `ws-${Date.now()}`, 
        name, 
        scenarios: [] 
      }]
    }));
  },
  
  deleteWorkspace: (id) => {
    set(state => {
      const { selectedIds } = state;
      const newState: Partial<AppStore> = {
        workspaces: state.workspaces.filter(w => w.id !== id)
      };
      
      if (selectedIds.workspace === id) {
        newState.selectedIds = { workspace: null, scenario: null, node: null };
        newState.view = 'workspaces';
      }
      
      return newState as any;
    });
  },
  
  createScenario: (name) => {
    if (!name.trim()) return;
    const { selectedIds } = get();
    
    if (!selectedIds.workspace) return;
    
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === selectedIds.workspace ? {
          ...w, 
          scenarios: [...w.scenarios, { 
            id: `sc-${Date.now()}`, 
            name, 
            description: '', 
            nodes: [] 
          }]
        } : w
      )
    }));
  },
  
  deleteScenario: (id) => {
    const { selectedIds } = get();
    
    set(state => {
      const newState: Partial<AppStore> = {
        workspaces: state.workspaces.map(w => 
          w.id === selectedIds.workspace ? {
            ...w, 
            scenarios: w.scenarios.filter(s => s.id !== id)
          } : w
        )
      };
      
      if (selectedIds.scenario === id) {
        newState.selectedIds = { ...selectedIds, scenario: null, node: null };
        newState.view = 'scenarios';
      }
      
      return newState as any;
    });
  }
});

export default createWorkspaceSlice;