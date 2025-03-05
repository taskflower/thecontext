// src/store/scenarioStore.tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Scenario, ConnectionType } from '@/types';
import { OperationResult } from './dataStore.types';
import { useDataStore } from './dataStore';

interface ScenarioState {
  // Data collection
  scenarios: Scenario[];
  
  // Validation helpers
  isScenarioNameUnique: (name: string, excludeScenarioId?: string) => boolean;
  
  // Scenario actions
  getScenarioById: (scenarioId: string) => Scenario | undefined;
  addScenario: (scenario: Scenario) => OperationResult<string>;
  updateScenario: (id: string, updates: Partial<Scenario>) => OperationResult;
  deleteScenario: (id: string) => OperationResult;
  
  // Connection management
  addScenarioConnection: (scenarioId: string, connectedId: string, connectionType?: ConnectionType) => OperationResult;
  removeScenarioConnection: (scenarioId: string, connectedId: string) => OperationResult;
  getConnectedScenarios: (scenarioId: string) => Scenario[];
}

export const useScenarioStore = create<ScenarioState>()(
  persist(
    (set, get) => ({
      // Initial data collection
      scenarios: [],
      
      // Validation helper function
      isScenarioNameUnique: (name, excludeScenarioId) => {
        return !get().scenarios.some(
          scenario => 
            scenario.id !== excludeScenarioId && 
            scenario.title.toLowerCase() === name.toLowerCase()
        );
      },
      
      // Scenario finder function
      getScenarioById: (scenarioId) => {
        return get().scenarios.find(scenario => scenario.id === scenarioId);
      },
      
      // Scenario actions
      addScenario: (scenario) => {
        // Validate scenario name is unique
        if (!get().isScenarioNameUnique(scenario.title)) {
          return {
            success: false,
            error: `Nie można utworzyć scenariusza: Scenariusz o nazwie "${scenario.title}" już istnieje.`
          };
        }
        
        // Add scenario if validation passes
        set((state) => ({ 
          scenarios: [...state.scenarios, scenario] 
        }));
        
        return {
          success: true,
          data: scenario.id
        };
      },
      
      updateScenario: (id, updates) => {
        const currentScenario = get().scenarios.find(s => s.id === id);
        
        if (!currentScenario) {
          return {
            success: false,
            error: "Nie można zaktualizować scenariusza: Scenariusz nie został znaleziony."
          };
        }
        
        // If title is being updated, check for uniqueness
        if (updates.title && updates.title !== currentScenario.title) {
          if (!get().isScenarioNameUnique(updates.title, id)) {
            return {
              success: false,
              error: `Nie można zaktualizować scenariusza: Scenariusz o nazwie "${updates.title}" już istnieje.`
            };
          }
          
          // If the scenario has a folder, update the folder name too
          if (currentScenario.folderId) {
            const dataStore = useDataStore.getState();
            const folder = dataStore.folders.find(f => f.id === currentScenario.folderId);
            
            if (folder) {
              // Check if the new folder name would be unique
              if (!dataStore.isFolderNameUnique(updates.title, folder.parentId, folder.id)) {
                return {
                  success: false,
                  error: `Nie można zaktualizować folderu scenariusza: Folder o nazwie "${updates.title}" już istnieje na tym samym poziomie.`
                };
              }
              
              // Update folder name to match new scenario title in dataStore
              dataStore.updateFolder(currentScenario.folderId, { name: updates.title });
            }
          }
        }
        
        // Update the scenario
        set((state) => ({
          scenarios: state.scenarios.map(scenario => 
            scenario.id === id 
              ? { ...scenario, ...updates } 
              : scenario
          )
        }));
        
        return { success: true };
      },
      
      deleteScenario: (id) => {
        // Find the scenario to get its folder ID
        const scenario = get().scenarios.find(p => p.id === id);
        
        if (!scenario) {
          return {
            success: false,
            error: "Nie można usunąć scenariusza: Scenariusz nie został znaleziony."
          };
        }
        
        // If scenario has a folder, delete it using dataStore
        if (scenario.folderId) {
          const dataStore = useDataStore.getState();
          dataStore.deleteFolder(scenario.folderId);
        }
        
        // Remove the scenario
        set((state) => ({
          scenarios: state.scenarios.filter(p => p.id !== id)
        }));
        
        return { success: true };
      },
      
      // Scenario connection actions
      addScenarioConnection: (scenarioId, connectedId, connectionType = 'related') => {
        const scenario = get().scenarios.find(s => s.id === scenarioId);
        const connectedScenario = get().scenarios.find(s => s.id === connectedId);
        
        if (!scenario) {
          return {
            success: false,
            error: "Nie można utworzyć połączenia: Scenariusz źródłowy nie został znaleziony."
          };
        }
        
        if (!connectedScenario) {
          return {
            success: false,
            error: "Nie można utworzyć połączenia: Scenariusz docelowy nie został znaleziony."
          };
        }
        
        // Check if connection already exists
        if (scenario.connections?.includes(connectedId)) {
          return {
            success: false,
            error: "Nie można utworzyć połączenia: Połączenie już istnieje."
          };
        }
        
        set((state) => {
          const updatedScenarios = state.scenarios.map(s => {
            if (s.id === scenarioId) {
              const connections = s.connections || [];
              return { 
                ...s, 
                connections: [...connections, connectedId],
                connectionType
              };
            }
            return s;
          });
          
          return { scenarios: updatedScenarios };
        });
        
        return { success: true };
      },
      
      removeScenarioConnection: (scenarioId, connectedId) => {
        const scenario = get().scenarios.find(s => s.id === scenarioId);
        
        if (!scenario) {
          return {
            success: false,
            error: "Nie można usunąć połączenia: Scenariusz nie został znaleziony."
          };
        }
        
        if (!scenario.connections?.includes(connectedId)) {
          return {
            success: false,
            error: "Nie można usunąć połączenia: Połączenie nie istnieje."
          };
        }
        
        set((state) => {
          const updatedScenarios = state.scenarios.map(s => {
            if (s.id === scenarioId && s.connections) {
              return {
                ...s,
                connections: s.connections.filter(id => id !== connectedId)
              };
            }
            return s;
          });
          
          return { scenarios: updatedScenarios };
        });
        
        return { success: true };
      },
      
      getConnectedScenarios: (scenarioId) => {
        const scenario = get().scenarios.find(s => s.id === scenarioId);
        if (!scenario || !scenario.connections) return [];
        
        return get().scenarios.filter(s => scenario.connections?.includes(s.id));
      }
    }),
    {
      name: 'app-scenarios-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        scenarios: state.scenarios
      }),
    }
  )
);