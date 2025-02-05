/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Template } from "../types/template";

interface TasksStore {
  reset: any;
  templates: Template[];
  addTemplate: (template: Template) => void;
  updateTemplate: (template: Template) => void;
  removeTemplate: (id: string) => void;
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) =>
        set((state) => ({
          templates: [
            ...state.templates,
            { ...template, steps: template.steps || [] },
          ],
        })),
      updateTemplate: (template) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === template.id
              ? { ...template, steps: template.steps || [] }
              : t
          ),
        })),
      reset: () =>
        set(() => ({
          templates: [],
        })),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
    }),

    {
      name: "templates",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ templates: state.templates }),
    }
  )
);
