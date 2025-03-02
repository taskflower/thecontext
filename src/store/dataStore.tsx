/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/dataStore.ts
import { DocItem, Folder, Project, Status, Task } from '@/types';
import { create } from 'zustand';

// Initial folder structure with special Projects root folder
const initialFolders: Folder[] = [
  { id: 'root', name: 'All Documents', parentId: null },
  { id: 'projects', name: 'Projects', parentId: 'root', isProjectRoot: true }
];

interface DataState {
  // Data collections
  folders: Folder[];
  docItems: DocItem[];
  projects: Project[];
  tasks: Task[];
  
  // Project actions
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
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
  projects: [],
  tasks: [],
  
  // Project actions
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(project => 
      project.id === id 
        ? { ...project, ...updates } 
        : project
    )
  })),
  
  deleteProject: (id) => set((state) => {
    // Find the project to get its folder ID
    const project = state.projects.find(p => p.id === id);
    
    if (!project) return state;
    
    // Create a function to recursively collect folder IDs to delete
    const getAllChildFolderIds = (folderId: string): string[] => {
      const children = state.folders.filter(f => f.parentId === folderId);
      if (children.length === 0) return [folderId];
      
      return [
        folderId,
        ...children.flatMap(child => getAllChildFolderIds(child.id))
      ];
    };
    
    // Get all folder IDs to delete if project has a folder
    const folderIdsToDelete = project.folderId 
      ? getAllChildFolderIds(project.folderId) 
      : [];
    
    // Get all tasks related to this project
    // todo:'tasksToDelete' is assigned a value but never used.
    // const tasksToDelete = state.tasks.filter(t => t.projectId === id);
    
    return {  
      // Remove the project
      projects: state.projects.filter(p => p.id !== id),
      
      // Remove the project's folder and all its subfolders
      folders: state.folders.filter(f => !folderIdsToDelete.includes(f.id)),
      
      // Remove any documents in those folders
      docItems: state.docItems.filter(d => 
        !d.folderId || !folderIdsToDelete.includes(d.folderId)
      ),
      
      // Remove associated tasks
      tasks: state.tasks.filter(t => t.projectId !== id)
    };
  }),
  
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