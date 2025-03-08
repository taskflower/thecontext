// src/plugins/TaskContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import { TaskContext } from './types';

interface TaskContextProviderProps {
  taskId: string;
  initialContext?: TaskContext;
  children: React.ReactNode;
}

// Context type definition
interface TaskContextValue {
  taskId: string;
  context: TaskContext;
  updateContext: (updates: Partial<TaskContext>) => void;
  resetContext: () => void;
}

// Create the context
const TaskContextContext = createContext<TaskContextValue | null>(null);

/**
 * Provider component for managing task context data
 * Allows sharing data between steps in the same task
 */
export function TaskContextProvider({
  taskId,
  initialContext = {},
  children
}: TaskContextProviderProps) {
  // Store the task context
  const [context, setContext] = useState<TaskContext>(initialContext);
  
  // Function to update the context
  const updateContext = useCallback((updates: Partial<TaskContext>) => {
    setContext(prevContext => ({
      ...prevContext,
      ...updates
    }));
  }, []);
  
  // Function to reset the context to initial state
  const resetContext = useCallback(() => {
    setContext(initialContext);
  }, [initialContext]);
  
  // Create the context value
  const contextValue: TaskContextValue = {
    taskId,
    context,
    updateContext,
    resetContext
  };
  
  return (
    <TaskContextContext.Provider value={contextValue}>
      {children}
    </TaskContextContext.Provider>
  );
}

/**
 * Hook for accessing and updating task context in components
 */
export function useTaskContext(): TaskContextValue {
  const context = useContext(TaskContextContext);
  
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskContextProvider');
  }
  
  return context;
}

/**
 * Hook for accessing a specific value from the task context
 */
export function useTaskContextValue<T>(key: string, defaultValue?: T): [T, (value: T) => void] {
  const { context, updateContext } = useTaskContext();
  
  const value = (context[key] !== undefined ? context[key] : defaultValue) as T;
  
  const setValue = useCallback((newValue: T) => {
    updateContext({ [key]: newValue });
  }, [key, updateContext]);
  
  return [value, setValue];
}