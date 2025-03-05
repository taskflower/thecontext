// src/services/TaskService.ts
import { Step, Task } from "@/types";
import { useTaskStore, useStepStore, useWizardStore } from "@/store";

/**
 * TaskService provides centralized business logic for task-related operations
 * to avoid duplicate logic spread across UI components.
 */
class TaskService {
  /**
   * Checks if a task can be executed
   * @param task The task to check
   * @param steps The steps associated with the task
   * @returns An object with isExecutable flag and optionally an error message
   */
  canExecuteTask(task: Task, steps: Step[]): { isExecutable: boolean; errorMessage?: string } {
    // Check if task exists
    if (!task) {
      return { isExecutable: false, errorMessage: "Task not found." };
    }
    
    // Check if task has steps
    if (!steps || steps.length === 0) {
      return { 
        isExecutable: false, 
        errorMessage: "No steps defined for this task. Please add at least one step first." 
      };
    }
    
    return { isExecutable: true };
  }

  /**
   * Prepares a task for execution by resetting step statuses
   * @param task The task to prepare
   * @param steps The steps associated with the task
   * @returns Object with updates for task and steps
   */
  prepareTaskExecution(task: Task, steps: Step[]): { 
    taskUpdates: Partial<Task>; 
    stepUpdates: Array<{ stepId: string; updates: Partial<Step> }> 
  } {
    // Sort steps by order
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    
    // Reset all steps to pending
    const stepUpdates = sortedSteps.map(step => ({
      stepId: step.id,
      updates: {
        status: "pending" as const,
        result: null
      }
    }));
    
    // Set task's currentStepId to the first step if there is one
    const taskUpdates: Partial<Task> = {
      currentStepId: sortedSteps.length > 0 ? sortedSteps[0].id : null,
      status: "in-progress" as const
    };
    
    return { taskUpdates, stepUpdates };
  }

  /**
   * Execute a task by preparing all steps and opening the wizard
   * @param taskId The ID of the task to execute
   * @returns A boolean indicating whether execution started successfully
   */
  executeTask(taskId: string): boolean {
    // Get dependencies from stores
    const taskStore = useTaskStore.getState();
    const stepStore = useStepStore.getState();
    const wizardStore = useWizardStore.getState();
    
    // Get task and steps
    const task = taskStore.getTaskById(taskId);
    const steps = stepStore.getTaskSteps(taskId).sort((a, b) => a.order - b.order);
    
    // Validate
    const { isExecutable, errorMessage } = this.canExecuteTask(task!, steps);
    if (!isExecutable) {
      alert(errorMessage);
      return false;
    }
    
    // Prepare
    const { taskUpdates, stepUpdates } = this.prepareTaskExecution(task!, steps);
    
    // Apply updates to steps
    stepUpdates.forEach(({ stepId, updates }) => {
      stepStore.updateStep(stepId, updates);
    });
    
    // Apply updates to task
    taskStore.updateTask(taskId, taskUpdates);
    
    // Adding small delay to ensure state updates are processed
    setTimeout(() => {
      wizardStore.openWizard(taskId);
    }, 100);
    
    return true;
  }
}

export const taskService = new TaskService();
export default taskService;