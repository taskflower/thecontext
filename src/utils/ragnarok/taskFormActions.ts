import { useDocumentStore } from "@/store/docStore";
import { TaskState } from "firebase/firestore";
import { SetState, GetState } from "./tasksInterfaces";

export interface TaskFormActions {
  setDialogOpen: (isOpen: boolean) => void;
  setTaskFormData: (data: Partial<TaskState['taskFormData']>) => void;
  resetTaskForm: () => void;
  setEditingTask: (taskId: string | null) => void;
  setStatusFilter: (status: TaskState['selectedStatusFilter']) => void;
  handleAddTask: () => Promise<string | void>;
  handleEditTask: () => void;
  prepareEditTask: (taskId: string) => void;
}

export const taskFormActions = (set: SetState, get: GetState): TaskFormActions => ({
  setDialogOpen: (isOpen: boolean) =>
    set((state) => ({
      ...state,
      isDialogOpen: isOpen,
    })),

  setTaskFormData: (data: Partial<TaskState['taskFormData']>) =>
    set((state) => ({
      ...state,
      taskFormData: { ...state.taskFormData, ...data },
    })),

  resetTaskForm: () => {
    const { containers } = useDocumentStore.getState();
    set((state) => ({
      ...state,
      taskFormData: {
        title: '',
        description: '',
        priority: 'medium',
        containerId: containers[0]?.id || '',
        templateId: '',
      },
      editingTaskId: null,
    }));
  },

  setEditingTask: (taskId: string | null) =>
    set((state) => ({
      ...state,
      editingTaskId: taskId,
    })),

  setStatusFilter: (status: TaskState['selectedStatusFilter']) =>
    set((state) => ({
      ...state,
      selectedStatusFilter: status,
    })),

  handleAddTask: async () => {
    const { taskFormData, createTaskWithAI, addTask, resetTaskForm, setDialogOpen } = get();

    if (!taskFormData.title.trim()) return;

    let taskId: string;

    if (taskFormData.templateId) {
      taskId = await createTaskWithAI(
        taskFormData.title,
        taskFormData.description,
        taskFormData.containerId,
        taskFormData.templateId
      );
    } else {
      taskId = addTask({
        title: taskFormData.title,
        description: taskFormData.description,
        status: 'pending',
        priority: taskFormData.priority,
        steps: [],
        containerId: taskFormData.containerId,
        relatedDocumentIds: [],
      });
    }

    resetTaskForm();
    setDialogOpen(false);
    return taskId;
  },

  handleEditTask: () => {
    const { taskFormData, editingTaskId, updateTask, resetTaskForm, setDialogOpen } = get();

    if (!editingTaskId || !taskFormData.title.trim()) return;

    updateTask(editingTaskId, {
      title: taskFormData.title,
      description: taskFormData.description,
      priority: taskFormData.priority,
      containerId: taskFormData.containerId,
    });

    resetTaskForm();
    setDialogOpen(false);
  },

  prepareEditTask: (taskId: string) => {
    const task = get().tasks.find(t => t.id === taskId);
    const { containers } = useDocumentStore.getState();

    if (!task) return;

    set((state) => ({
      ...state,
      editingTaskId: taskId,
      taskFormData: {
        title: task.title,
        description: task.description,
        priority: task.priority,
        containerId: task.containerId || containers[0]?.id || '',
        templateId: '',
      },
      isDialogOpen: true,
    }));
  },
});
