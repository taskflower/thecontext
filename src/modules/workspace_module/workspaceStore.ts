// src/modules/workspaces_module/workspaceStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useScenariosMultiStore, MultiScenario } from '../scenarios_module/scenariosMultiStore';
import { usePluginStore } from '../plugins_system/pluginStore';

// Changed from enum to string for custom types
export type WorkspaceType = string;

export interface WorkspaceContext {
  url?: string;
  audience?: string;
  businessGoal?: string;
  keywords?: string[];
  competitors?: string[];
  notes?: string;
  [key: string]: any; // Allow for custom context properties
}

export interface Workspace {
  id: string;
  name: string;
  description: string;
  type: WorkspaceType;
  typeIcon: string; // Added typeIcon field to store the selected icon
  context: WorkspaceContext;
  scenarioIds: string[]; // IDs of scenarios in this workspace
  createdAt: number;
  updatedAt: number;
}

interface WorkspaceState {
  workspaces: Record<string, Workspace>;
  currentWorkspaceId: string | null;
  
  // Actions
  createWorkspace: (name: string, type: WorkspaceType, typeIcon: string, description?: string, context?: WorkspaceContext) => string;
  updateWorkspace: (id: string, updates: Partial<Omit<Workspace, 'id' | 'createdAt' | 'scenarioIds'>>) => void;
  deleteWorkspace: (id: string) => void;
  
  setCurrentWorkspace: (id: string | null) => void;
  
  // Context management
  updateWorkspaceContext: (id: string, contextUpdates: Partial<WorkspaceContext>) => void;
  
  // Scenario management
  addScenarioToWorkspace: (workspaceId: string, scenarioId: string) => void;
  removeScenarioFromWorkspace: (workspaceId: string, scenarioId: string) => void;
  createScenarioInWorkspace: (workspaceId: string, name: string) => string | null;
  
  // Import/Export
  exportWorkspaceToJson: (id: string) => any;
  importWorkspaceFromJson: (data: any) => string | null;
  
  // Utility functions
  getWorkspaceScenarios: (id: string) => MultiScenario[];
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: {},
      currentWorkspaceId: null,
      
      createWorkspace: (name, type, typeIcon, description = '', context = {}) => {
        const id = uuidv4();
        const now = Date.now();
        
        set(state => ({
          workspaces: {
            ...state.workspaces,
            [id]: {
              id,
              name,
              type,
              typeIcon,
              description,
              context,
              scenarioIds: [],
              createdAt: now,
              updatedAt: now
            }
          },
          currentWorkspaceId: id
        }));
        
        return id;
      },
      
      updateWorkspace: (id, updates) => {
        set(state => {
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
        set(state => {
          const newWorkspaces = { ...state.workspaces };
          delete newWorkspaces[id];
          
          return {
            workspaces: newWorkspaces,
            currentWorkspaceId: state.currentWorkspaceId === id ? null : state.currentWorkspaceId
          };
        });
      },
      
      setCurrentWorkspace: (id) => {
        set({ currentWorkspaceId: id });
      },
      
      updateWorkspaceContext: (id, contextUpdates) => {
        set(state => {
          if (!state.workspaces[id]) return state;
          
          return {
            workspaces: {
              ...state.workspaces,
              [id]: {
                ...state.workspaces[id],
                context: {
                  ...state.workspaces[id].context,
                  ...contextUpdates
                },
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      addScenarioToWorkspace: (workspaceId, scenarioId) => {
        set(state => {
          if (!state.workspaces[workspaceId]) return state;
          
          // Ensure we don't add duplicates
          if (state.workspaces[workspaceId].scenarioIds.includes(scenarioId)) {
            return state;
          }
          
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: {
                ...state.workspaces[workspaceId],
                scenarioIds: [...state.workspaces[workspaceId].scenarioIds, scenarioId],
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      removeScenarioFromWorkspace: (workspaceId, scenarioId) => {
        set(state => {
          if (!state.workspaces[workspaceId]) return state;
          
          return {
            workspaces: {
              ...state.workspaces,
              [workspaceId]: {
                ...state.workspaces[workspaceId],
                scenarioIds: state.workspaces[workspaceId].scenarioIds.filter(id => id !== scenarioId),
                updatedAt: Date.now()
              }
            }
          };
        });
      },
      
      createScenarioInWorkspace: (workspaceId, name) => {
        const workspace = get().workspaces[workspaceId];
        if (!workspace) return null;
        
        // Create new scenario with workspace context
        const scenarioId = `${name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        const newScenario: MultiScenario = {
          id: scenarioId,
          name,
          nodes: {},
          edges: [],
          categories: ['default', 'flow', 'template'],
          nodeResponses: {},
          workspaceId: workspaceId, // Link back to workspace
          workspaceContext: { ...workspace.context } // Copy workspace context
        };
        
        // Add to scenarios store
        useScenariosMultiStore.getState().addScenario(newScenario);
        
        // Add to workspace
        get().addScenarioToWorkspace(workspaceId, scenarioId);
        
        return scenarioId;
      },
      
      exportWorkspaceToJson: (id) => {
        // Upewnij się, że aktywny scenariusz jest zsynchronizowany przed eksportem
        useScenariosMultiStore.getState().syncActiveScenarioToCurrent();
        
        const workspace = get().workspaces[id];
        if (!workspace) return null;
        
        // Get all scenarios in this workspace
        const scenarios = get().getWorkspaceScenarios(id);
        
        return {
          workspace,
          scenarios
        };
      },
      
      importWorkspaceFromJson: (data) => {
        if (!data.workspace || !data.workspace.id) return null;
        
        // Import workspace
        set(state => ({
          workspaces: {
            ...state.workspaces,
            [data.workspace.id]: {
              ...data.workspace,
              // Add default typeIcon if missing in imported data
              typeIcon: data.workspace.typeIcon || 'box',
              updatedAt: Date.now()
            }
          },
          // Set this as the current workspace
          currentWorkspaceId: data.workspace.id
        }));
        
        // Prepare to handle plugin connections
        const { plugins, activatePlugin } = usePluginStore.getState();
        const usedPluginIds = new Set();
        
        // Discover all plugin IDs referenced in the import
        if (Array.isArray(data.scenarios)) {
          data.scenarios.forEach((scenario:any) => {
            if (scenario.nodes) {
              Object.values(scenario.nodes).forEach((node:any) => {
                if (node.pluginId) {
                  usedPluginIds.add(node.pluginId);
                }
              });
            }
          });
          
          // Activate all required plugins before importing scenarios
          usedPluginIds.forEach((pluginId:any) => {
            if (plugins[pluginId]) {
              console.log(`Activating plugin ${pluginId} for imported workspace`);
              activatePlugin(pluginId);
            } else {
              console.warn(`Plugin ${pluginId} used in import not available - plugin connections will be broken`);
            }
          });
          
          // Import all scenarios
          data.scenarios.forEach((scenario:any) => {
            useScenariosMultiStore.getState().importScenario(scenario);
          });
          
          // Set the current scenario to the first one from the workspace
          if (data.scenarios.length > 0) {
            useScenariosMultiStore.getState().setCurrentScenario(data.scenarios[0].id);
            
            // Sync scenario data
            useScenariosMultiStore.getState().syncCurrentScenarioToActive();
          }
        }
        
        console.log(`Imported workspace "${data.workspace.name}" with ${usedPluginIds.size} plugin dependencies`);
        return data.workspace.id;
      },
      
      getWorkspaceScenarios: (id) => {
        const workspace = get().workspaces[id];
        if (!workspace) return [];
        
        const { scenarios } = useScenariosMultiStore.getState();
        return workspace.scenarioIds
          .filter(scenarioId => scenarios[scenarioId])
          .map(scenarioId => scenarios[scenarioId]);
      }
    }),
    {
      name: 'workspace-storage',
      // Only persist essential data
      partialize: (state) => ({
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId
      })
    }
  )
);