/* eslint-disable @typescript-eslint/no-explicit-any */
import { KanbanBoard, KanbanInstance, KanbanStatus } from "@/types/kaban";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface KanbanStore {
  reset: any;
  boardTemplates: KanbanBoard[];
  instances: KanbanInstance[];

  addBoardTemplate: (
    template: Omit<KanbanBoard, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateBoardTemplate: (template: KanbanBoard) => void;
  removeBoardTemplate: (id: string) => void;

  createInstance: (templateId: string, name: string) => void;
  updateInstanceTaskStatus: (
    instanceId: string,
    taskId: string,
    status: KanbanStatus
  ) => void;
  removeInstance: (id: string) => void;
}

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set) => ({
      boardTemplates: [],
      instances: [],

      addBoardTemplate: (template) =>
        set((state) => ({
          boardTemplates: [
            ...state.boardTemplates,
            {
              ...template,
              id: Date.now().toString(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        })),

      updateBoardTemplate: (template) =>
        set((state) => ({
          boardTemplates: state.boardTemplates.map((t) =>
            t.id === template.id ? template : t
          ),
        })),

      removeBoardTemplate: (id) =>
        set((state) => ({
          boardTemplates: state.boardTemplates.filter((t) => t.id !== id),
        })),

      createInstance: (templateId, name) =>
        set((state) => {
          const template = state.boardTemplates.find(
            (t) => t.id === templateId
          );
          if (!template) return state;

          const instance: KanbanInstance = {
            id: Date.now().toString(),
            templateId,
            name,
            tasks: template.tasks.map((task) => ({
              id: Date.now().toString() + task.id,
              templateTaskId: task.id,
              status: "todo",
              completedAt: null,
            })),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          return {
            instances: [...state.instances, instance],
          };
        }),

      updateInstanceTaskStatus: (instanceId, taskId, status) =>
        set((state) => ({
          instances: state.instances.map((instance) =>
            instance.id === instanceId
              ? {
                  ...instance,
                  updatedAt: new Date(),
                  tasks: instance.tasks.map((task) =>
                    task.id === taskId
                      ? {
                          ...task,
                          status,
                          completedAt: status === "done" ? new Date() : null,
                        }
                      : task
                  ),
                }
              : instance
          ),
        })),
      reset: () =>
        set(() => ({
          boardTemplates: [],
          instances: [],
        })),

      removeInstance: (id) =>
        set((state) => ({
          instances: state.instances.filter((i) => i.id !== id),
        })),
    }),
    {
      name: "kanban-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        boardTemplates: state.boardTemplates,
        instances: state.instances,
      }),
    }
  )
);
