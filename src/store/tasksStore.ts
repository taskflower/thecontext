import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { Template } from '../types/template'

interface TasksStore {
  templates: Template[]
  addTemplate: (template: Template) => void
  updateTemplate: (template: Template) => void
  removeTemplate: (id: string) => void
}

export const useTasksStore = create<TasksStore>()(
  persist(
    (set) => ({
      templates: [],
      addTemplate: (template) => 
        set((state) => ({
          templates: [...state.templates, { ...template, steps: template.steps || [] }]
        })),
      updateTemplate: (template) => 
        set((state) => ({
          templates: state.templates.map(t => 
            t.id === template.id ? { ...template, steps: template.steps || [] } : t
          )
        })),
      removeTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter(t => t.id !== id)
        }))
    }),
    {
      name: 'templates',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ templates: state.templates }),
    }
  )
)