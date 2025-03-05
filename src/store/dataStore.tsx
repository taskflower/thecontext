/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/dataStore.ts
import { Folder } from '@/types';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { DataState } from './dataStore.types';

// Initial folder structure with special Scenarios root folder
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Documents', parentId: null },
  { id: 'scenarios', name: 'Scenarios', parentId: 'root', isScenarioRoot: true }
];

export const useDataStore = create<DataState>()(
  persist(
    (set, get) => ({
      // Initial data collections
      folders: initialFolders,
      docItems: [],
      scenarios: [],
      
      // Validation helper functions
      isFolderNameUnique: (name, parentId, excludeFolderId) => {
        return !get().folders.some(
          folder => 
            folder.id !== excludeFolderId && 
            folder.parentId === parentId && 
            folder.name.toLowerCase() === name.toLowerCase()
        );
      },
      
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
            const folder = get().folders.find(f => f.id === currentScenario.folderId);
            
            if (folder) {
              // Check if the new folder name would be unique
              if (!get().isFolderNameUnique(updates.title, folder.parentId, folder.id)) {
                return {
                  success: false,
                  error: `Nie można zaktualizować folderu scenariusza: Folder o nazwie "${updates.title}" już istnieje na tym samym poziomie.`
                };
              }
              
              // Update folder name to match new scenario title
              set((state) => ({
                folders: state.folders.map(f => 
                  f.id === currentScenario.folderId 
                    ? { ...f, name: updates.title! } 
                    : f
                )
              }));
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
        
        // Create a function to recursively collect folder IDs to delete
        const getAllChildFolderIds = (folderId: string): string[] => {
          const children = get().folders.filter(f => f.parentId === folderId);
          if (children.length === 0) return [folderId];
          
          return [
            folderId,
            ...children.flatMap(child => getAllChildFolderIds(child.id))
          ];
        };
        
        // Get all folder IDs to delete if scenario has a folder
        const folderIdsToDelete = scenario.folderId 
          ? getAllChildFolderIds(scenario.folderId) 
          : [];
        
        set((state) => ({
          // Remove the scenario
          scenarios: state.scenarios.filter(p => p.id !== id),
          
          // Remove the scenario's folder and all its subfolders
          folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
          
          // Remove any documents in those folders
          docItems: state.docItems.filter(d => 
            !d.folderId || !folderIdsToDelete.includes(d.folderId)
          )
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
      },
      
      // Other actions
      addFolder: (folder) => {
        // Validate folder name is unique at the same level
        if (!get().isFolderNameUnique(folder.name, folder.parentId)) {
          return {
            success: false,
            error: `Nie można utworzyć folderu: Folder o nazwie "${folder.name}" już istnieje na tym samym poziomie.`
          };
        }
        
        set((state) => ({ 
          folders: [...state.folders, folder] 
        }));
        
        return {
          success: true,
          data: folder.id
        };
      },
      
      deleteFolder: (id) => {
        const folder = get().folders.find(f => f.id === id);
        
        if (!folder) {
          return {
            success: false,
            error: "Nie można usunąć folderu: Folder nie został znaleziony."
          };
        }
        
        // Function to get all nested folder IDs
        const getAllChildFolderIds = (folderId: string): string[] => {
          const children = get().folders.filter(f => f.parentId === folderId);
          if (children.length === 0) return [folderId];
          
          return [
            folderId,
            ...children.flatMap(child => getAllChildFolderIds(child.id))
          ];
        };
        
        const folderIdsToDelete = getAllChildFolderIds(id);
        
        set((state) => ({
          folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
          docItems: state.docItems.filter(d => 
            !d.folderId || !folderIdsToDelete.includes(d.folderId)
          )
        }));
        
        return { success: true };
      },
      
      addDocItem: (docItem) => {
        set((state) => ({ 
          docItems: [...state.docItems, docItem] 
        }));
        
        return {
          success: true,
          data: docItem.id
        };
      },
      
      updateDocItem: (id, updates) => {
        const docItem = get().docItems.find(d => d.id === id);
        
        if (!docItem) {
          return {
            success: false,
            error: "Nie można zaktualizować dokumentu: Dokument nie został znaleziony."
          };
        }
        
        set((state) => ({
          docItems: state.docItems.map(d => 
            d.id === id 
              ? { ...d, ...updates, updatedAt: new Date().toISOString() } 
              : d
          )
        }));
        
        return { success: true };
      },
      
      // Helper functions
      getChildFolders: (parentId) => get().folders.filter(folder => folder.parentId === parentId),
      
      getDocItemsInFolder: (folderId) => get().docItems.filter(docItem => docItem.folderId === folderId),
      
      getDocItem: (docItemId) => get().docItems.find(docItem => docItem.id === docItemId),
      
      getFolderPath: (folderId) => {
        const path: Folder[] = [];
        let currentId: string | null = folderId;
        
        while (currentId) {
          const folder = get().folders.find(f => f.id === currentId);
          if (folder) {
            path.unshift(folder);
            currentId = folder.parentId;
          } else {
            break;
          }
        }
        
        return path;
      },
      
      searchDocItems: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().docItems.filter(doc => 
          doc.title.toLowerCase().includes(lowerQuery) || 
          doc.content.toLowerCase().includes(lowerQuery) || 
          doc.metaKeys.some(key => key.toLowerCase().includes(lowerQuery))
        );
      }
    }),
    {
      name: 'app-data-storage', // unique name for localStorage key
      storage: createJSONStorage(() => localStorage), // use localStorage
      partialize: (state) => ({
        // Only persist these keys
        folders: state.folders,
        docItems: state.docItems,
        scenarios: state.scenarios,
      }),
    }
  )
);