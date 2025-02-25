import { ITaskStep } from "@/utils/ragnarok/types";
import { SetState, GetState } from "./tasksInterfaces";
import { generateId } from "./utils";

export interface StepActions {
  addStep: (taskId: string, step: Omit<ITaskStep, "id" | "taskId">) => string;
  updateStep: (taskId: string, stepId: string, updates: Partial<ITaskStep>) => void;
  removeStep: (taskId: string, stepId: string) => void;
  reorderSteps: (taskId: string, stepIds: string[]) => void;
}

export const stepActions = (set: SetState, get: GetState): StepActions => ({
  addStep: (taskId: string, stepData) => {
    const stepId = generateId();
    
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;
      
      const newStep: ITaskStep = {
        ...stepData,
        id: stepId,
        taskId,
        status: "pending"
      };
      
      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? { ...t, steps: [...t.steps, newStep], updatedAt: new Date() }
            : t
        ),
      };
    });
    
    return stepId;
  },

  updateStep: (taskId: string, stepId: string, updates: Partial<ITaskStep>) =>
    set((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              steps: task.steps.map((step) =>
                step.id === stepId ? { ...step, ...updates } : step
              ),
              updatedAt: new Date(),
            }
          : task
      ),
    })),

  removeStep: (taskId: string, stepId: string) =>
    set((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              steps: task.steps.filter((step) => step.id !== stepId),
              updatedAt: new Date(),
            }
          : task
      ),
    })),

  reorderSteps: (taskId: string, stepIds: string[]) =>
    set((state) => {
      const task = state.tasks.find((t) => t.id === taskId);
      if (!task) return state;

      const reorderedSteps = stepIds
        .map((stepId, index) => {
          const step = task.steps.find((s) => s.id === stepId);
          return step ? { ...step, order: index + 1 } : null;
        })
        .filter((s): s is ITaskStep => s !== null);

      const otherSteps = task.steps.filter(
        (step) => !stepIds.includes(step.id)
      );

      return {
        ...state,
        tasks: state.tasks.map((t) =>
          t.id === taskId
            ? {
                ...t,
                steps: [...reorderedSteps, ...otherSteps].sort(
                  (a, b) => a.order - b.order
                ),
                updatedAt: new Date(),
              }
            : t
        ),
      };
    }),
});
