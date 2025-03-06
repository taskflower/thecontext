// src/services/TaskService.ts
import { Task } from "@/types";
import { useTaskStore, useStepStore, useWizardStore, useScenarioStore } from "@/store";


/**
 * TaskService provides centralized business logic for task-related operations
 * to avoid duplicate logic spread across UI components.
 */
class TaskService {
  /**
   * Checks if a task can be executed
   * @param taskId ID of the task to check
   * @returns An object with isExecutable flag and optionally an error message
   */
  canExecuteTask(taskId: string): { isExecutable: boolean; errorMessage?: string } {
    const { getTaskById } = useTaskStore.getState();
    const { getTaskSteps } = useStepStore.getState();
    
    const task = getTaskById(taskId);
    
    // Check if task exists
    if (!task) {
      return { isExecutable: false, errorMessage: "Task not found." };
    }
    
    // Get steps for this task
    const steps = getTaskSteps(taskId);
    
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
   * @param taskId The ID of the task to prepare
   * @returns Success indicator
   */
  prepareTaskExecution(taskId: string): boolean {
    const { getTaskById, updateTask } = useTaskStore.getState();
    const { getTaskSteps, updateStep } = useStepStore.getState();
    
    const task = getTaskById(taskId);
    if (!task) return false;
    
    // Get steps for this task
    const steps = getTaskSteps(taskId);
    if (!steps || steps.length === 0) return false;
    
    // Sort steps by order
    const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
    
    // Reset all steps to pending
    sortedSteps.forEach(step => {
      updateStep(step.id, {
        status: "pending",
        result: null
      });
    });
    
    // Set task's currentStepId to the first step and status to in-progress
    updateTask(taskId, {
      currentStepId: sortedSteps[0].id,
      status: "in-progress"
    });
    
    return true;
  }

  /**
   * Execute a task by preparing all steps and opening the wizard
   * @param taskId The ID of the task to execute
   * @returns A boolean indicating whether execution started successfully
   */
  executeTask(taskId: string): boolean {
    // Validate
    const { isExecutable, errorMessage } = this.canExecuteTask(taskId);
    if (!isExecutable) {
      alert(errorMessage);
      return false;
    }
    
    // Prepare
    const prepared = this.prepareTaskExecution(taskId);
    if (!prepared) {
      alert("Error preparing task for execution");
      return false;
    }
    
    // Open wizard
    const { openWizard } = useWizardStore.getState();
    openWizard(taskId);
    
    return true;
  }
  
  /**
   * Creates a new task with default values
   * @returns The newly created task ID or error object
   */
  createTask(): { success: boolean; data?: string; errorMessage?: string } {
    const { scenarios } = useScenarioStore.getState();
    
    if (!scenarios || scenarios.length === 0) {
      return {
        success: false,
        errorMessage: "You must create a project before you can add tasks."
      };
    }

    const { addTask } = useTaskStore.getState();
    const { setActiveTask } = useWizardStore.getState();
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: "New task",
      description: "",
      status: "todo",
      priority: "medium",
      dueDate: new Date().toISOString().split("T")[0],
      scenarioId: scenarios[0]?.id || "",
      currentStepId: null,
      data: {},
    };
    
    const result = addTask(newTask);
    
    if (result.success) {
      setActiveTask(newTask.id);
    }
    
    return result;
  }
  
  /**
   * Deletes a task after confirmation
   * @param taskId The ID of the task to delete
   * @returns Success indicator
   */
  deleteTask(taskId: string): boolean {
    if (!confirm("Are you sure you want to delete this task?")) {
      return false;
    }
    
    const { deleteTask } = useTaskStore.getState();
    const { setActiveTask, activeTaskId } = useWizardStore.getState();
    
    const result = deleteTask(taskId);
    
    if (result.success && activeTaskId === taskId) {
      setActiveTask(null);
    }
    
    return result.success;
  }
}

export const taskService = new TaskService();
export default taskService;