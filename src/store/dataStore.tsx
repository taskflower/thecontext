/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/store/dataStore.ts
import { DocItem, Folder, Project, Status, Task } from '@/types';
import { create } from 'zustand';

// Initial folder structure to maintain basic functionality
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Documents', parentId: null }
];

interface DataState {
  // Data collections
  folders: Folder[];
  docItems: DocItem[];
  projects: Project[];
  tasks: Task[];
  
  // Data actions
  addProject: (project: Project) => void;
  addFolder: (folder: Folder) => void;
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
  projects: [],
  tasks: [],
  
  // Data actions
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
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