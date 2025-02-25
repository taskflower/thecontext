import { ITask } from "@/utils/ragnarok/types";
import { GetState, SetState } from "./tasksInterfaces";
import { generateId } from "./utils";

export interface TaskActions {
  addTask: (task: Omit<ITask, "id" | "createdAt" | "updatedAt">) => string;
  removeTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<ITask>) => void;
  setSelectedTask: (taskId: string | null) => void;
}

export const taskActions = (set: SetState, get: GetState): TaskActions => ({
  addTask: (task) => {
    const id = generateId();
    const now = new Date();

    set((state) => ({
      ...state,
      tasks: [
        ...state.tasks,
        {
          ...task,
          id,
          status: task.status || "pending",
          priority: task.priority || "medium",
          createdAt: now,
          updatedAt: now,
          steps: task.steps || [],
          relatedDocumentIds: task.relatedDocumentIds || []
        }
      ]
    }));

    return id;
  },

  removeTask: (taskId: string) =>
    set((state) => ({
      ...state,
      tasks: state.tasks.filter((t) => t.id !== taskId),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    })),

  updateTask: (taskId: string, updates: Partial<ITask>) =>
    set((state) => ({
      ...state,
      tasks: state.tasks.map((task) =>
        task.id === taskId
          ? { ...task, ...updates, updatedAt: new Date() }
          : task
      ),
    })),

  setSelectedTask: (taskId: string | null) =>
    set((state) => ({
      ...state,
      selectedTaskId: taskId
    })),
});
