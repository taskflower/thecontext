
import { GetState, SetState } from "./tasksInterfaces";
import { generateId } from "../utils";
import { ITaskTemplate } from "./taskTypes";

export interface TemplateActions {
  addTemplate: (template: Omit<ITaskTemplate, "id">) => string;
  updateTemplate: (templateId: string, updates: Partial<ITaskTemplate>) => void;
  removeTemplate: (templateId: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const templateActions = (set: SetState, get: GetState): TemplateActions => ({
  addTemplate: (template) => {
    const id = generateId();
    
    set((state) => ({
      ...state,
      templates: [
        ...state.templates,
        {
          ...template,
          id
        }
      ]
    }));
    
    return id;
  },
  
  updateTemplate: (templateId: string, updates: Partial<ITaskTemplate>) =>
    set((state) => ({
      ...state,
      templates: state.templates.map((template) =>
        template.id === templateId
          ? { ...template, ...updates }
          : template
      ),
    })),
    
  removeTemplate: (templateId: string) =>
    set((state) => ({
      ...state,
      templates: state.templates.filter((t) => t.id !== templateId),
    })),
});
