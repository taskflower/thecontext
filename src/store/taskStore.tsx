/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/taskStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { TaskState } from "./taskStore.types";

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (task) => {
        set((state) => ({
          tasks: [...state.tasks, task],
        }));

        return {
          success: true,
          data: task.id,
        };
      },

      updateTask: (id, updates) => {
        const task = get().getTaskById(id);

        if (!task) {
          return {
            success: false,
            error: "Could not update task: Task not found.",
          };
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
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
            error: "Could not update task data: Task not found.",
          };
        }

        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId
              ? { ...task, data: { ...task.data, ...data } }
              : task
          ),
        }));

        return { success: true };
      },

      deleteTask: (id) => {
        const task = get().getTaskById(id);

        if (!task) {
          return {
            success: false,
            error: "Could not delete task: Task not found.",
          };
        }

        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));

        return { success: true };
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTasksByStatus: (status) => {
        return get().tasks.filter((task) => task.status === status);
      },

      getTasksCountByStatus: (status) => {
        return get().getTasksByStatus(status).length;
      },

      getTasksByScenarioId: (scenarioId) => {
        return get().tasks.filter((task) => task.scenarioId === scenarioId);
      },
    }),
    {
      name: "app-tasks-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
