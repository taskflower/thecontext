/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/workspaceStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useScenarioStore } from './scenarioStore';


export interface Workspace {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  context: Record<string, any>;
  scenarioIds: string[];
}

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  currentWorkspaceId: string | null;
}

interface WorkspaceActions {
  // Workspace CRUD
  createWorkspace: (name: string, description?: string) => string;
  updateWorkspace: (id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt'>>) => void;
  deleteWorkspace: (id: string) => void;
  duplicateWorkspace: (id: string, newName?: string) => string;
  
  // Workspace selection
  setCurrentWorkspace: (id: string | null) => void;
  getCurrentWorkspace: () => Workspace | null;
  
  // Context management
  getWorkspaceContext: (workspaceId: string) => Record<string, any> | null;
  updateWorkspaceContext: (workspaceId: string, updates: Record<string, any>) => void;
  
  // Scenario management within workspace
  addScenarioToWorkspace: (workspaceId: string, scenarioId: string) => void;
  removeScenarioFromWorkspace: (workspaceId: string, scenarioId: string) => void;
  
  // Import/Export
  exportWorkspace: (id: string) => string;
  importWorkspace: (data: string) => string;
}

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    (set, get) => ({
      workspaces: {},
      currentWorkspaceId: null,
      
      // Workspace CRUD
      createWorkspace: (name, description = '') => {
        const id = nanoid();
        const workspace: Workspace = {
          id,
          name,
          description,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          context: {},
          scenarioIds: []
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
          const newWorkspaces = { ...state.workspaces };
          delete newWorkspaces[id];
          
          // Get scenarios to delete
          const scenarioIds = state.workspaces[id]?.scenarioIds || [];
          
          // Delete associated scenarios
          const scenarioStore = useScenarioStore.getState();
          scenarioIds.forEach(scenarioId => {
            scenarioStore.deleteScenario(scenarioId);
          });
          
          // Update current workspace if needed
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
        
        // Create new workspace
        const newWorkspace: Workspace = {
          ...workspace,
          id: newId,
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          scenarioIds: []
        };
        
        // Duplicate scenarios
        const scenarioStore = useScenarioStore.getState();
        const newScenarioIds = workspace.scenarioIds.map(scenarioId => {
          return scenarioStore.duplicateScenario(scenarioId, undefined, newId);
        });
        
        newWorkspace.scenarioIds = newScenarioIds;
        
        set((state) => ({
          workspaces: { ...state.workspaces, [newId]: newWorkspace }
        }));
        
        return newId;
      },
      
      // Workspace selection
      setCurrentWorkspace: (id) => {
        set({ currentWorkspaceId: id });
      },
      
      getCurrentWorkspace: () => {
        const { currentWorkspaceId, workspaces } = get();
        return currentWorkspaceId ? workspaces[currentWorkspaceId] : null;
      },
      
      // Context management
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
      
      // Scenario management within workspace
      addScenarioToWorkspace: (workspaceId, scenarioId) => {
        set((state) => {
          const workspace = state.workspaces[workspaceId];
          if (!workspace) return state;
          
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
      },
      
      // Import/Export
      exportWorkspace: (id) => {
        const workspace = get().workspaces[id];
        if (!workspace) return '';
        
        // Get scenarios
        const scenarioStore = useScenarioStore.getState();
        const scenarios = workspace.scenarioIds.map(scenarioId => 
          scenarioStore.exportScenario(scenarioId)
        );
        
        const exportData = {
          workspace,
          scenarios
        };
        
        return JSON.stringify(exportData);
      },
      
      importWorkspace: (data) => {
        try {
          const importData = JSON.parse(data);
          const { workspace, scenarios } = importData;
          
          if (!workspace || !Array.isArray(scenarios)) {
            throw new Error('Invalid import data format');
          }
          
          // Generate new ID to avoid collisions
          const newId = nanoid();
          const newWorkspace: Workspace = {
            ...workspace,
            id: newId,
            scenarioIds: [],
            createdAt: Date.now(),
            updatedAt: Date.now()
          };
          
          // Import scenarios
          const scenarioStore = useScenarioStore.getState();
          const newScenarioIds = scenarios.map(scenarioData => {
            return scenarioStore.importScenario(scenarioData, newId);
          });
          
          newWorkspace.scenarioIds = newScenarioIds;
          
          // Add to store
          set((state) => ({
            workspaces: { ...state.workspaces, [newId]: newWorkspace },
            currentWorkspaceId: newId
          }));
          
          return newId;
        } catch (e) {
          console.error('Error importing workspace:', e);
          return '';
        }
      }
    }),
    {
      name: 'workspace-storage',
      // Only persist the workspaces and currentWorkspaceId
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId
      })
    }
  )
);