/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Workspace } from '../types/common';
import { useScenarioStore } from './scenarioStore';

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  currentWorkspaceId: string | null;
}

interface WorkspaceActions {
  createWorkspace: (name: string, description?: string) => string;
  updateWorkspace: (id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>) => void;
  deleteWorkspace: (id: string) => void;
  duplicateWorkspace: (id: string, newName?: string) => string;
  setCurrentWorkspace: (id: string | null) => void;
  getCurrentWorkspace: () => Workspace | null;
  getWorkspaceContext: (workspaceId: string) => Record<string, any> | null;
  updateWorkspaceContext: (workspaceId: string, updates: Record<string, any>) => void;
  addScenarioToWorkspace: (workspaceId: string, scenarioId: string) => void;
  removeScenarioFromWorkspace: (workspaceId: string, scenarioId: string) => void;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: {},
      currentWorkspaceId: null,
      
      createWorkspace: (name, description = '') => {
        const id = nanoid();
        const workspace: Workspace = {
          id,
          name,
          description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          context: {},
          scenarioIds: [],
          nodes: [] // Add the missing nodes property
        };
        
        set((state) => ({
          workspaces: { ...state.workspaces, [id]: workspace },
          currentWorkspaceId: id
        }));
        
        return id;
      },
      
      updateWorkspace: (id, updates) => {
        set((state) => {
          if (!state.workspaces[id]) return state;
          
          return {
            workspaces: {
              ...state.workspaces,
              [id]: {
                ...state.workspaces[id],
                ...updates,
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      deleteWorkspace: (id) => {
        set((state) => {
          const workspace = state.workspaces[id];
          if (!workspace) return state;
          
          // Usunięcie powiązanych scenariuszy
          const scenarioStore = useScenarioStore.getState();
          [...workspace.scenarioIds].forEach(scenarioId => {
            scenarioStore.deleteScenario(scenarioId);
          });
          
          const newWorkspaces = { ...state.workspaces };
          delete newWorkspaces[id];
          
          // Aktualizacja bieżącego workspace
          let newCurrentId = state.currentWorkspaceId;
          if (newCurrentId === id) {
            const remainingIds = Object.keys(newWorkspaces);
            newCurrentId = remainingIds.length > 0 ? remainingIds[0] : null;
          }
          
          return {
            workspaces: newWorkspaces,
            currentWorkspaceId: newCurrentId
          };
        });
      },
      
      duplicateWorkspace: (id, newName) => {
        const workspace = get().workspaces[id];
        if (!workspace) return '';
        
        const newId = nanoid();
        const name = newName || `${workspace.name} (Copy)`;
        
        // Tworzenie nowego workspace
        const newWorkspace: Workspace = {
          ...workspace,
          id: newId,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          scenarioIds: [],
          nodes: [...workspace.nodes] // Properly copy the nodes array
        };
        
        // Dodajemy najpierw workspace do stanu
        set((state) => ({
          workspaces: { ...state.workspaces, [newId]: newWorkspace }
        }));
        
        // Duplikacja scenariuszy
        const scenarioStore = useScenarioStore.getState();
        const newScenarioIds = workspace.scenarioIds.map(scenarioId => {
          return scenarioStore.duplicateScenario(scenarioId, undefined, newId);
        });
        
        // Aktualizacja workspace o nowe scenariusze
        set((state) => ({
          workspaces: { 
            ...state.workspaces, 
            [newId]: {
              ...state.workspaces[newId],
              scenarioIds: newScenarioIds
            }
          }
        }));
        
        return newId;
      },
      
      setCurrentWorkspace: (id) => {
        set({ currentWorkspaceId: id });
      },
      
      getCurrentWorkspace: () => {
        const { currentWorkspaceId, workspaces } = get();
        return currentWorkspaceId ? workspaces[currentWorkspaceId] : null;
      },
      
      getWorkspaceContext: (workspaceId) => {
        const workspace = get().workspaces[workspaceId];
        return workspace ? workspace.context : null;
      },
      
      updateWorkspaceContext: (workspaceId, updates) => {
        set((state) => {
          const workspace = state.workspaces[workspaceId];
          if (!workspace) return state;
          
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: {
                ...workspace,
                context: { ...workspace.context, ...updates },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      addScenarioToWorkspace: (workspaceId, scenarioId) => {
        set((state) => {
          const workspace = state.workspaces[workspaceId];
          if (!workspace) return state;
          
          // Sprawdź czy scenariusz już istnieje w workspace
          if (workspace.scenarioIds.includes(scenarioId)) {
            return state;
          }
          
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: {
                ...workspace,
                scenarioIds: [...workspace.scenarioIds, scenarioId],
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      removeScenarioFromWorkspace: (workspaceId, scenarioId) => {
        set((state) => {
          const workspace = state.workspaces[workspaceId];
          if (!workspace) return state;
          
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: {
                ...workspace,
                scenarioIds: workspace.scenarioIds.filter(id => id !== scenarioId),
                updatedAt: Date.now()
              }
            }
          };
        });
      }
    }),
    {
      name: 'workspace-storage',
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId
      })
    }
  )
);