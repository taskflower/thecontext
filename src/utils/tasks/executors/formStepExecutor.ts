// src/utils/tasks/executors/formStepExecutor.ts
import { useTaskStore } from '@/store/taskStore';

export async function executeFormStep(taskId: string, stepId: string): Promise<boolean> {
  const { tasks, updateStep } = useTaskStore.getState();
  
  const task = tasks.find((t: { id: string }) => t.id === taskId);
  if (!task) return false;
  
  const step = task.steps.find((s: { id: string }) => s.id === stepId);
  if (!step) return false;
  
  // Dla formularzy nie ma automatycznego wykonania
  // Oczekujemy na interakcję użytkownika
  updateStep(taskId, stepId, { status: 'in_progress' });
  
  return true;
}