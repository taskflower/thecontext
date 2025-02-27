import { create } from 'zustand';
import { Project, Task, Folder, File, Status, TabName, ViewMode } from './types';

interface TaskFlowState {
  activeTab: TabName;
  viewMode: ViewMode;
  showNewProjectModal: boolean;
  currentFolder: string;
  folders: Folder[];
  files: File[];
  projects: Project[];
  tasks: Task[];

  // Actions
  setActiveTab: (tab: TabName) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleNewProjectModal: () => void;
  navigateToFolder: (folderId: string) => void;
  addProject: (project: Project) => void;
  addFolder: (folder: Folder) => void;
  addFile: (file: File) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Status) => void;

  // Helpers
  getChildFolders: (parentId: string) => Folder[];
  getFilesInFolder: (folderId: string) => File[];
  getTasksByStatus: (status: Status) => Task[];
  getTasksCountByStatus: (status: Status) => number;
  getFolderPath: (folderId: string) => Folder[];
}

export const useTaskFlowStore = create<TaskFlowState>((set, get) => ({
  activeTab: 'dashboard',
  viewMode: 'cards',
  showNewProjectModal: false,
  currentFolder: 'root',
  
  folders: [
    { id: 'root', name: 'All Documents', parentId: null },
    { id: 'projects', name: 'Projects', parentId: 'root' },
    { id: 'website', name: 'Website Redesign', parentId: 'projects' },
    { id: 'marketing', name: 'Marketing Campaign', parentId: 'projects' },
  ],
  
  files: [
    { id: 'file1', name: 'Project Plan Template.docx', folderId: 'projects' },
    { id: 'file2', name: 'Budget Overview.xlsx', folderId: 'projects' },
    { id: 'file3', name: 'Team Assignments.pdf', folderId: 'projects' },
    { id: 'file4', name: 'Logo Designs.png', folderId: 'website' },
    { id: 'file5', name: 'Content Strategy.docx', folderId: 'marketing' },
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
  navigateToFolder: (folderId) => set(() => ({ currentFolder: folderId })),
  
  addProject: (project) => set((state) => ({ 
    projects: [...state.projects, project] 
  })),
  
  addFolder: (folder) => set((state) => ({ 
    folders: [...state.folders, folder] 
  })),
  
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
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
  
  getFilesInFolder: (folderId) => {
    return get().files.filter(file => file.folderId === folderId);
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
}));