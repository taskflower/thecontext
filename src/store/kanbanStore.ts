// src/store/kanbanStore.ts
import { KanbanInstance, KanbanStore } from '@/types/kaban';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';


export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set) => ({
      boardTemplates: [],
      instances: [],

      addBoardTemplate: (template) =>
        set((state) => ({
          boardTemplates: [...state.boardTemplates, {
            ...template,
            id: Date.now().toString()
          }]
        })),

      updateBoardTemplate: (template) =>
        set((state) => ({
          boardTemplates: state.boardTemplates.map(t =>
            t.id === template.id ? template : t
          )
        })),

      removeBoardTemplate: (id) =>
        set((state) => ({
          boardTemplates: state.boardTemplates.filter(t => t.id !== id)
        })),

      createInstance: (templateId, name) =>
        set((state) => {
          const template = state.boardTemplates.find(t => t.id === templateId);
          if (!template) return state;

          const instance: KanbanInstance = {
            id: Date.now().toString(),
            templateId,
            name,
            tasks: template.tasks.map(task => ({
              id: Date.now().toString() + task.id,
              templateTaskId: task.id,
              status: 'todo'
            })),
            createdAt: new Date()
          };

          return {
            instances: [...state.instances, instance]
          };
        }),

      updateInstanceTaskStatus: (instanceId, taskId, status) =>
        set((state) => ({
          instances: state.instances.map(instance =>
            instance.id === instanceId
              ? {
                  ...instance,
                  tasks: instance.tasks.map(task =>
                    task.id === taskId
                      ? { ...task, status, completedAt: status === 'done' ? new Date() : undefined }
                      : task
                  )
                }
              : instance
          )
        })),

      removeInstance: (id) =>
        set((state) => ({
          instances: state.instances.filter(i => i.id !== id)
        }))
    }),
    {
      name: 'kanban-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ boardTemplates: state.boardTemplates, instances: state.instances }),
    }
  )
);