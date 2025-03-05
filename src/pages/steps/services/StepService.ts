/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/steps/services/StepService.ts
import { Step } from "@/types";
import { useStepStore, useTaskStore, useWizardStore } from "@/store";
import { triggerPluginAction } from "@/pages/stepsPlugins/pluginHandlers";
import { validateStep } from "@/pages/stepsPlugins/validation";

/**
 * StepService provides centralized business logic for step-related operations
 * to avoid duplicate logic spread across UI components.
 */
class StepService {
  /**
   * Checks if a step can be executed
   * @param step The step to check
   * @returns An object with isExecutable flag and optionally an error message
   */
  canExecuteStep(step: Step): { isExecutable: boolean; errorMessage?: string } {
    // Check if step exists
    if (!step) {
      return { isExecutable: false, errorMessage: "Step not found." };
    }
    
    // Validate step configuration
    const validationResult = validateStep(step);
    if (!validationResult.isValid) {
      return { 
        isExecutable: false, 
        errorMessage: validationResult.errorMessage || "Step configuration is invalid." 
      };
    }
    
    return { isExecutable: true };
  }

  /**
   * Execute a specific step
   * @param stepId The ID of the step to execute
   * @returns A boolean indicating whether execution started successfully
   */
  executeStep(stepId: string): boolean {
    // Get dependencies from stores
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    
    // Get step and its task
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Find the task this step belongs to
    const task = taskStore.tasks.find(t => {
      const taskSteps = stepStore.getTaskSteps(t.id);
      return taskSteps.some(s => s.id === stepId);
    });
    
    if (!task) {
      console.error(`Could not find task for step ${stepId}`);
      return false;
    }
    
    // Validate step
    const { isExecutable, errorMessage } = this.canExecuteStep(step);
    if (!isExecutable) {
      alert(errorMessage);
      return false;
    }
    
    // Reset step status to pending
    stepStore.updateStep(stepId, {
      status: "pending",
      result: null
    });
    
    // Update task status to in-progress if it's not already
    if (task.status !== "in-progress") {
      taskStore.updateTask(task.id, {
        status: "in-progress",
        currentStepId: stepId
      });
    }
    
    // Try to trigger plugin action
    const success = triggerPluginAction(stepId);
    
    if (!success) {
      // If no handler was found or automatic execution is not possible,
      // open the wizard to allow manual interaction
      const wizardStore = useWizardStore.getState();
      wizardStore.openWizard(task.id, stepId);
    }
    
    return true;
  }

  /**
   * Complete a step with the given result
   * @param stepId The ID of the step to complete
   * @param result The result data to store with the step
   * @returns A boolean indicating success
   */
  completeStep(stepId: string, result: any = {}): boolean {
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    
    // Get step
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Update step status
    stepStore.updateStep(stepId, {
      status: "completed",
      result
    });
    
    // Find the task this step belongs to
    const task = taskStore.tasks.find(t => {
      const taskSteps = stepStore.getTaskSteps(t.id);
      return taskSteps.some(s => s.id === stepId);
    });
    
    if (!task) {
      console.error(`Could not find task for step ${stepId}`);
      return false;
    }
    
    // Check if all steps are completed
    const allTaskSteps = stepStore.getTaskSteps(task.id);
    const allCompleted = allTaskSteps.every(s => s.status === "completed");
    
    // If all steps are completed, mark task as completed
    if (allCompleted) {
      taskStore.updateTask(task.id, {
        status: "completed"
      });
    }
    
    return true;
  }

  /**
   * Skip a step without executing it
   * @param stepId The ID of the step to skip
   * @returns A boolean indicating success
   */
  skipStep(stepId: string): boolean {
    const stepStore = useStepStore.getState();
    
    // Get step
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Update step status
    stepStore.updateStep(stepId, {
      status: "skipped"
    });
    
    return true;
  }

  /**
   * Reorder steps for a task
   * @param taskId The ID of the task containing the steps
   * @param stepIds An array of step IDs in the desired order
   * @returns A boolean indicating success
   */
  reorderSteps(taskId: string, stepIds: string[]): boolean {
    const stepStore = useStepStore.getState();
    
    // Get all steps for the task
    const steps = stepStore.getTaskSteps(taskId);
    
    // Validate that all provided step IDs actually belong to this task
    const taskStepIds = steps.map(s => s.id);
    const allStepsPresent = stepIds.every(id => taskStepIds.includes(id));
    
    if (!allStepsPresent || stepIds.length !== steps.length) {
      console.error(`Invalid step IDs provided for reordering`);
      return false;
    }
    
    // Update order for each step
    stepIds.forEach((stepId, index) => {
      stepStore.updateStep(stepId, { order: index });
    });
    
    return true;
  }

  /**
   * Get aggregated result data from all steps in a task
   * @param taskId The ID of the task
   * @returns Combined result data from all completed steps
   */
  getAggregatedTaskResults(taskId: string): Record<string, any> {
    const stepStore = useStepStore.getState();
    
    // Get all completed steps for the task
    const steps = stepStore.getTaskSteps(taskId)
      .filter(step => step.status === "completed" && step.result);
    
    // Combine results from all steps
    return steps.reduce((results, step) => {
      // Use step title as the key for its results
      // Replace spaces with underscores and make lowercase for consistency
      const resultKey = step.title
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '');
      
      return {
        ...results,
        [resultKey]: step.result
      };
    }, {});
  }
}

export const stepService = new StepService();
export default stepService;