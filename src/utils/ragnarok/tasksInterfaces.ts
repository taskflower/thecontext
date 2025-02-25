import { ITask, ITaskTemplate } from "@/utils/ragnarok/types";

export interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  containerId: string;
  templateId: string;
}

export interface TaskState {
  tasks: ITask[];
  templates: ITaskTemplate[];
  selectedTaskId: string | null;
  isDialogOpen: boolean;
  taskFormData: TaskFormData;
  editingTaskId: string | null;
  selectedStatusFilter: 'all' | 'pending' | 'in_progress' | 'completed' | 'failed';
}

export type SetState = (fn: (state: TaskState) => TaskState) => void;
export type GetState = () => TaskState;