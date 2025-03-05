/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/taskStore.ts
import { create } from 'zustand';
import { Task, Status } from '@/types';
import { OperationResult } from './dataStore.types';

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  
  addTask: (task) => {
    set((state) => ({
      tasks: [...state.tasks, task]
    }));
    
    return {
      success: true,
      data: task.id
    };
  },
  
  updateTask: (id, updates) => {
    const task = get().getTaskById(id);
    
    if (!task) {
      return {
        success: false,
        error: "Nie można zaktualizować zadania: Zadanie nie zostało znalezione."
      };
    }
    
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === id ? { ...task, ...updates } : task
      )
    }));
    
    return { success: true };
  },
  
  updateTaskStatus: (taskId, status) => {
    return get().updateTask(taskId, { status });
  },
  
  updateTaskData: (taskId, data) => {
    const task = get().getTaskById(taskId);
    
    if (!task) {
      return {
        success: false,
        error: "Nie można zaktualizować danych zadania: Zadanie nie zostało znalezione."
      };
    }
    
    set((state) => ({
      tasks: state.tasks.map((task) => 
        task.id === taskId ? { ...task, data: { ...task.data, ...data } } : task
      )
    }));
    
    return { success: true };
  },
  
  deleteTask: (id) => {
    const task = get().getTaskById(id);
    
    if (!task) {
      return {
        success: false,
        error: "Nie można usunąć zadania: Zadanie nie zostało znalezione."
      };
    }
    
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    }));
    
    return { success: true };
  },
  
  getTaskById: (id) => {
    return get().tasks.find(task => task.id === id);
  },
  
  getTasksByStatus: (status) => {
    return get().tasks.filter(task => task.status === status);
  },
  
  getTasksCountByStatus: (status) => {
    return get().getTasksByStatus(status).length;
  },
  
  getTasksByScenarioId: (scenarioId) => {
    return get().tasks.filter(task => task.scenarioId === scenarioId);
  }
}));

// Import this at the top of the file
interface TaskState {
  // Data collection
  tasks: Task[];
  
  // Task actions
  addTask: (task: Task) => OperationResult<string>;
  updateTask: (taskId: string, updates: Partial<Task>) => OperationResult;
  updateTaskStatus: (taskId: string, status: Status) => OperationResult;
  updateTaskData: (taskId: string, data: Record<string, any>) => OperationResult;
  deleteTask: (taskId: string) => OperationResult;
  
  // Helper functions
  getTasksByStatus: (status: Status) => Task[];
  getTasksCountByStatus: (status: Status) => number;
  getTasksByScenarioId: (scenarioId: string) => Task[];
  getTaskById: (taskId: string) => Task | undefined;
}