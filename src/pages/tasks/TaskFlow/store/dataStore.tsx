/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/store/dataStore.ts
import { create } from 'zustand';
import { DocItem, Folder, Project, Status, Step, StepStatus, Task } from '../types';



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
  steps: Step[];
  
  // Data actions
  addProject: (project: Project) => void;
  addFolder: (folder: Folder) => void;
  addDocItem: (docItem: DocItem) => void;
  updateDocItem: (id: string, updates: Partial<DocItem>) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;
  updateTaskData: (taskId: string, data: Record<string, any>) => void;
  addStep: (step: Step) => void;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  completeStep: (stepId: string, result?: Record<string, any>) => void;
  skipStep: (stepId: string) => void;
  
  // Helper functions
  getChildFolders: (parentId: string) => Folder[];
  getDocItemsInFolder: (folderId: string) => DocItem[];
  getDocItem: (docItemId: string) => DocItem | undefined;
  getTasksByStatus: (status: Status) => Task[];
  getTasksCountByStatus: (status: Status) => number;
  getFolderPath: (folderId: string) => Folder[];
  searchDocItems: (query: string) => DocItem[];
  getTaskSteps: (taskId: string) => Step[];
  getCurrentStep: (taskId: string) => Step | undefined;
}

export const useDataStore = create<DataState>((set, get) => ({
  // Initial data collections
  folders: initialFolders,
  docItems: [],
  projects: [],
  tasks: [],
  steps: [],
  
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
  
  addStep: (step) => set((state) => ({ 
    steps: [...state.steps, step] 
  })),
  
  updateStep: (stepId, updates) => set((state) => ({
    steps: state.steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    )
  })),
  
  completeStep: (stepId, result = {}) => {
    const step = get().steps.find(s => s.id === stepId);
    if (!step) return;
    
    set((state) => ({
      steps: state.steps.map(s => 
        s.id === stepId ? { ...s, status: 'completed' as StepStatus, result } : s
      )
    }));
  },
  
  skipStep: (stepId) => {
    const step = get().steps.find(s => s.id === stepId);
    if (!step) return;
    
    set((state) => ({
      steps: state.steps.map(s => 
        s.id === stepId ? { ...s, status: 'skipped' as StepStatus } : s
      )
    }));
  },
  
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
  },
  
  getTaskSteps: (taskId) => {
    return get().steps.filter(step => step.taskId === taskId);
  },
  
  getCurrentStep: (taskId) => {
    const task = get().tasks.find(t => t.id === taskId);
    if (!task) return undefined;
    
    if (task.currentStepId) {
      return get().steps.find(step => step.id === task.currentStepId);
    }
    
    // If no current step is set, return the first pending step
    const pendingSteps = get().steps
      .filter(step => step.taskId === taskId && step.status === 'pending')
      .sort((a, b) => a.order - b.order);
      
    return pendingSteps[0];
  }
}));