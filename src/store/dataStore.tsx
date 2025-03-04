/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/dataStore.ts
import { DocItem, Folder, Scenario, Status, Task, ConnectionType } from '@/types';
import { create } from 'zustand';

// Initial folder structure with special Scenarios root folder
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Documents', parentId: null },
  { id: 'scenarios', name: 'Scenarios', parentId: 'root', isScenarioRoot: true }
];

interface DataState {
  // Data collections
  folders: Folder[];
  docItems: DocItem[];
  scenarios: Scenario[];
  tasks: Task[];
  
  // Scenario actions
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => void;
  deleteScenario: (id: string) => void;
  addScenarioConnection: (scenarioId: string, connectedId: string, connectionType?: ConnectionType) => void;
  removeScenarioConnection: (scenarioId: string, connectedId: string) => void;
  getConnectedScenarios: (scenarioId: string) => Scenario[];
  
  // Other data actions
  addFolder: (folder: Folder) => void;
  deleteFolder: (id: string) => void;
  addDocItem: (docItem: DocItem) => void;
  updateDocItem: (id: string, updates: Partial<DocItem>) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  updateTaskData: (taskId: string, data: Record<string, any>) => void;
  deleteTask: (taskId: string) => void;
  
  // Helper functions
  getChildFolders: (parentId: string) => Folder[];
  getDocItemsInFolder: (folderId: string) => DocItem[];
  getDocItem: (docItemId: string) => DocItem | undefined;
  getTasksByStatus: (status: Status) => Task[];
  getTasksCountByStatus: (status: Status) => number;
  getFolderPath: (folderId: string) => Folder[];
  searchDocItems: (query: string) => DocItem[];
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial data collections
  folders: initialFolders,
  docItems: [],
  scenarios: [],
  tasks: [],
  
  // Scenario actions
  addScenario: (scenario) => set((state) => ({ 
    scenarios: [...state.scenarios, scenario] 
  })),
  
  updateScenario: (id, updates) => set((state) => ({
    scenarios: state.scenarios.map(scenario => 
      scenario.id === id 
        ? { ...scenario, ...updates } 
        : scenario
    )
  })),
  
  deleteScenario: (id) => set((state) => {
    // Find the scenario to get its folder ID
    const scenario = state.scenarios.find(p => p.id === id);
    
    if (!scenario) return state;
    
    // Create a function to recursively collect folder IDs to delete
    const getAllChildFolderIds = (folderId: string): string[] => {
      const children = state.folders.filter(f => f.parentId === folderId);
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
    
    // Get all tasks related to this scenario
    // todo:'tasksToDelete' is assigned a value but never used.
    // const tasksToDelete = state.tasks.filter(t => t.scenarioId === id);
    
    return {  
      // Remove the scenario
      scenarios: state.scenarios.filter(p => p.id !== id),
      
      // Remove the scenario's folder and all its subfolders
      folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
      
      // Remove any documents in those folders
      docItems: state.docItems.filter(d => 
        !d.folderId || !folderIdsToDelete.includes(d.folderId)
      ),
      
      // Remove associated tasks
      tasks: state.tasks.filter(t => t.scenarioId !== id)
    };
  }),

  // Scenario connection actions
  addScenarioConnection: (scenarioId, connectedId, connectionType = 'related') => set((state) => {
    const updatedScenarios = state.scenarios.map(scenario => {
      if (scenario.id === scenarioId) {
        const connections = scenario.connections || [];
        if (!connections.includes(connectedId)) {
          return { 
            ...scenario, 
            connections: [...connections, connectedId],
            connectionType
          };
        }
      }
      return scenario;
    });
    
    return { scenarios: updatedScenarios };
  }),
  
  removeScenarioConnection: (scenarioId, connectedId) => set((state) => {
    const updatedScenarios = state.scenarios.map(scenario => {
      if (scenario.id === scenarioId && scenario.connections) {
        return {
          ...scenario,
          connections: scenario.connections.filter(id => id !== connectedId)
        };
      }
      return scenario;
    });
    
    return { scenarios: updatedScenarios };
  }),
  
  getConnectedScenarios: (scenarioId) => {
    const scenario = get().scenarios.find(s => s.id === scenarioId);
    if (!scenario || !scenario.connections) return [];
    
    return get().scenarios.filter(s => scenario.connections?.includes(s.id));
  },
  
  // Other actions
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
  deleteFolder: (id) => set((state) => {
    // Function to get all nested folder IDs
    const getAllChildFolderIds = (folderId: string): string[] => {
      const children = state.folders.filter(f => f.parentId === folderId);
      if (children.length === 0) return [folderId];
      
      return [
        folderId,
        ...children.flatMap(child => getAllChildFolderIds(child.id))
      ];
    };
    
    const folderIdsToDelete = getAllChildFolderIds(id);
    
    return {
      folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
      docItems: state.docItems.filter(d => 
        !d.folderId || !folderIdsToDelete.includes(d.folderId)
      )
    };
  }),
  
  addDocItem: (docItem) => set((state) => ({ 
    docItems: [...state.docItems, docItem] 
  })),
  
  updateDocItem: (id, updates) => set((state) => ({
    docItems: state.docItems.map(docItem => 
      docItem.id === id 
        ? { ...docItem, ...updates, updatedAt: new Date().toISOString() } 
        : docItem
    )
  })),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    )
  })),
  
  updateTaskStatus: (taskId, status) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    )
  })),
  
  updateTaskData: (taskId, data) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === taskId ? { ...task, data: { ...(task.data || {}), ...data } } : task
    )
  })),
  
  deleteTask: (taskId) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== taskId)
  })),
  
  // Helper functions
  getChildFolders: (parentId) => get().folders.filter(folder => folder.parentId === parentId),
  
  getDocItemsInFolder: (folderId) => get().docItems.filter(docItem => docItem.folderId === folderId),
  
  getDocItem: (docItemId) => get().docItems.find(docItem => docItem.id === docItemId),
  
  getTasksByStatus: (status) => get().tasks.filter(task => task.status === status),
  
  getTasksCountByStatus: (status) => get().tasks.filter(task => task.status === status).length,
  
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
}));