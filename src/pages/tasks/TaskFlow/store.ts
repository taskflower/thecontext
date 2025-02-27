// src/pages/tasks/TaskFlow/store.ts

import { create } from 'zustand';
import { Project, Task, Folder, Document, Status, TabName, ViewMode } from './types';

interface TaskFlowState {
  activeTab: TabName;
  viewMode: ViewMode;
  showNewProjectModal: boolean;
  showNewDocumentModal: boolean;
  currentFolder: string;
  selectedDocument: string | null;
  folders: Folder[];
  documents: Document[];
  projects: Project[];
  tasks: Task[];

  // Actions
  setActiveTab: (tab: TabName) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleNewProjectModal: () => void;
  toggleNewDocumentModal: () => void;
  navigateToFolder: (folderId: string) => void;
  selectDocument: (documentId: string | null) => void;
  addProject: (project: Project) => void;
  addFolder: (folder: Folder) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;

  // Helpers
  getChildFolders: (parentId: string) => Folder[];
  getDocumentsInFolder: (folderId: string) => Document[];
  getDocument: (documentId: string) => Document | undefined;
  getTasksByStatus: (status: Status) => Task[];
  getTasksCountByStatus: (status: Status) => number;
  getFolderPath: (folderId: string) => Folder[];
  searchDocuments: (query: string) => Document[];
}

export const useTaskFlowStore = create<TaskFlowState>((set, get) => ({
  activeTab: 'dashboard',
  viewMode: 'cards',
  showNewProjectModal: false,
  showNewDocumentModal: false,
  currentFolder: 'root',
  selectedDocument: null,
  
  folders: [
    { id: 'root', name: 'All Documents', parentId: null },
    { id: 'projects', name: 'Projects', parentId: 'root' },
    { id: 'website', name: 'Website Redesign', parentId: 'projects' },
    { id: 'marketing', name: 'Marketing Campaign', parentId: 'projects' },
  ],
  
  documents: [
    { 
      id: 'doc1', 
      title: 'Project Plan Template', 
      content: 'This is a project plan template for our team projects.',
      metaKeys: ['template', 'project plan', 'management'],
      schema: {},
      folderId: 'projects',
      createdAt: '2025-02-15T10:30:00Z',
      updatedAt: '2025-02-15T10:30:00Z'
    },
    { 
      id: 'doc2', 
      title: 'Budget Overview', 
      content: 'Financial overview for Q1 2025 projects',
      metaKeys: ['budget', 'finance', 'Q1'],
      schema: {},
      folderId: 'projects',
      createdAt: '2025-02-10T14:45:00Z',
      updatedAt: '2025-02-20T09:15:00Z'
    },
    { 
      id: 'doc3', 
      title: 'Team Assignments', 
      content: 'Assignment details for team members across all current projects',
      metaKeys: ['team', 'assignments', 'roles'],
      schema: {},
      folderId: 'projects',
      createdAt: '2025-02-05T16:20:00Z',
      updatedAt: '2025-02-21T11:45:00Z'
    },
    { 
      id: 'doc4', 
      title: 'Logo Design Specifications', 
      content: 'Specifications for the new company logo design',
      metaKeys: ['design', 'logo', 'branding'],
      schema: {},
      folderId: 'website',
      createdAt: '2025-01-28T09:10:00Z',
      updatedAt: '2025-02-18T15:30:00Z'
    },
    { 
      id: 'doc5', 
      title: 'Content Strategy', 
      content: 'Digital marketing content strategy for Q1 2025',
      metaKeys: ['marketing', 'content', 'strategy'],
      schema: {},
      folderId: 'marketing',
      createdAt: '2025-02-01T13:25:00Z',
      updatedAt: '2025-02-16T10:20:00Z'
    },
  ],
  
  projects: [
    { 
      id: 'proj1', 
      title: 'Website Redesign', 
      description: 'Redesign company website with new branding',
      progress: 75,
      tasks: 12,
      completedTasks: 9,
      dueDate: 'Mar 15, 2025',
      folderId: 'website'
    },
    { 
      id: 'proj2', 
      title: 'Marketing Campaign', 
      description: 'Q1 digital marketing campaign for new product',
      progress: 30,
      tasks: 8,
      completedTasks: 2,
      dueDate: 'Apr 10, 2025',
      folderId: 'marketing'
    },
    { 
      id: 'proj3', 
      title: 'Mobile App Development', 
      description: 'iOS and Android app for customer engagement',
      progress: 15,
      tasks: 20,
      completedTasks: 3,
      dueDate: 'Jun 30, 2025',
      folderId: null
    },
  ],
  
  tasks: [
    { id: 'task1', title: 'Update landing page hero section', status: 'todo', priority: 'medium', dueDate: 'Mar 10, 2025', projectId: 'proj1' },
    { id: 'task2', title: 'Design new logo options', status: 'in-progress', priority: 'high', dueDate: 'Mar 5, 2025', projectId: 'proj1' },
    { id: 'task3', title: 'Develop contact form', status: 'review', priority: 'low', dueDate: 'Mar 12, 2025', projectId: 'proj1' },
    { id: 'task4', title: 'Create social media graphics', status: 'todo', priority: 'medium', dueDate: 'Mar 15, 2025', projectId: 'proj2' },
    { id: 'task5', title: 'Setup analytics tracking', status: 'todo', priority: 'high', dueDate: 'Mar 8, 2025', projectId: 'proj3' },
  ],

  // Actions
  setActiveTab: (tab) => set(() => ({ activeTab: tab })),
  setViewMode: (mode) => set(() => ({ viewMode: mode })),
  toggleNewProjectModal: () => set((state) => ({ showNewProjectModal: !state.showNewProjectModal })),
  toggleNewDocumentModal: () => set((state) => ({ showNewDocumentModal: !state.showNewDocumentModal })),
  navigateToFolder: (folderId) => set(() => ({ currentFolder: folderId })),
  selectDocument: (documentId) => set(() => ({ selectedDocument: documentId })),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
  addDocument: (document) => set((state) => ({ 
    documents: [...state.documents, document] 
  })),
  
  updateDocument: (id, updates) => set((state) => ({
    documents: state.documents.map(document => 
      document.id === id 
        ? { ...document, ...updates, updatedAt: new Date().toISOString() } 
        : document
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
  
  // Helper functions
  getChildFolders: (parentId) => {
    return get().folders.filter(folder => folder.parentId === parentId);
  },
  
  getDocumentsInFolder: (folderId) => {
    return get().documents.filter(document => document.folderId === folderId);
  },
  
  getDocument: (documentId) => {
    return get().documents.find(document => document.id === documentId);
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },
  
  getTasksCountByStatus: (status) => {
    return get().tasks.filter(task => task.status === status).length;
  },
  
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

  searchDocuments: (query) => {
    const lowerQuery = query.toLowerCase();
    return get().documents.filter(doc => 
      doc.title.toLowerCase().includes(lowerQuery) || 
      doc.content.toLowerCase().includes(lowerQuery) || 
      doc.metaKeys.some(key => key.toLowerCase().includes(lowerQuery))
    );
  },
}));