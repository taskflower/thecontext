/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/taskStore.types.ts
import { Status, Task } from '@/types';
import { OperationResult } from './dataStore.types';

export interface TaskState {
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