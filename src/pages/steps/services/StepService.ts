/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/steps/services/StepService.ts
import { Step } from "@/types";
import { useStepStore, useTaskStore, useWizardStore } from "@/store";
import { triggerPluginAction } from "@/pages/stepsPlugins/pluginHandlers";
import { validateStep } from "@/services/validation";

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
  
  // Validate the step
  const validationResult = validateStep(step);
  if (!validationResult.isValid) {
    return { 
      isExecutable: false, 
      errorMessage: validationResult.errorMessage || "Step validation failed." 
    };
  }
  
  return { isExecutable: true };
}
  /**
   * Get the task that a step belongs to
   * @param stepId ID of the step
   * @returns The task object or undefined
   */
  private getTaskForStep(stepId: string) {
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    
    const step = stepStore.getStepById(stepId);
    if (!step) return undefined;
    
    const taskId = step.taskId;
    return taskStore.getTaskById(taskId);
  }

  /**
   * Execute a specific step
   * @param stepId The ID of the step to execute
   * @returns A boolean indicating whether execution started successfully
   */
  executeStep(stepId: string): boolean {
    // Get dependencies from stores
    const stepStore = useStepStore.getState();
    const wizardStore = useWizardStore.getState();
    
    // Get step and validate
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Get associated task
    const task = this.getTaskForStep(stepId);
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
    
    // Update task status if needed
    const taskStore = useTaskStore.getState();
    if (task.status !== "in-progress") {
      taskStore.updateTask(task.id, {
        status: "in-progress",
        currentStepId: stepId
      });
    }
    
    // Check if step is currently displayed in wizard
    const { activeStepId } = wizardStore;
    const isStepActive = activeStepId === stepId;
    
    // Try to trigger plugin action
    const success = triggerPluginAction(stepId);
    
    if (!success) {
      // If step can't be executed automatically, open wizard
      if (!isStepActive) {
        // Only if step is not already active in wizard
        wizardStore.openWizard(task.id, stepId);
      }
    }
    
    return true;
  }

  /**
   * Complete a step with the given result and handle progression
   * @param stepId The ID of the step to complete
   * @param result The result data to store with the step
   * @returns A boolean indicating success
   */
  completeStep(stepId: string, result: any = {}): boolean {
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    const wizardStore = useWizardStore.getState();
    
    // Get step
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Create updated step for validation
    const updatedStep = {
      ...step,
      status: 'completed' as const,
      result
    };
    
    // Validate the step before completing it
    const validationResult = validateStep(updatedStep);
    if (!validationResult.isValid) {
      console.error(`Cannot complete step: ${validationResult.errorMessage}`);
      return false;
    }
    
    // Update step status
    stepStore.updateStep(stepId, {
      status: "completed",
      result
    });
    
    // Get task
    const taskId = step.taskId;
    const task = taskStore.getTaskById(taskId);
    
    if (!task) {
      console.error(`Could not find task for step ${stepId}`);
      return false;
    }
    
    // Check if step is currently in wizard
    const { activeStepId, activeTaskId } = wizardStore;
    const isStepInWizard = activeStepId === stepId && activeTaskId === taskId;
    
    // If step is currently active in wizard, let wizard handle it
    if (isStepInWizard) {
      return true;
    }
    
    // If step is not in wizard, execute standard logic
    
    // Check if this was the current step
    if (task.currentStepId === stepId) {
      // Find the next step
      const nextStep = stepStore.getNextStep(taskId, stepId);
      
      if (nextStep) {
        // Move to next step
        taskStore.updateTask(taskId, { 
          currentStepId: nextStep.id 
        });
        
        // Set next step to in-progress
        stepStore.updateStep(nextStep.id, { 
          status: 'in-progress' 
        });
      } else {
        // No more steps, check if all steps are complete
        const allCompleted = stepStore.areAllStepsCompleted(taskId);
        
        if (allCompleted) {
          // Mark task as completed
          taskStore.updateTaskStatus(taskId, 'completed');
        }
      }
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
    const taskStore = useTaskStore.getState();
    const wizardStore = useWizardStore.getState();
    
    // Get step
    const step = stepStore.getStepById(stepId);
    if (!step) {
      console.error(`Step with ID ${stepId} not found.`);
      return false;
    }
    
    // Check if step is currently in wizard
    const { activeStepId, activeTaskId } = wizardStore;
    const isStepInWizard = activeStepId === stepId && activeTaskId === step.taskId;
    
    // If step is currently active in wizard, let wizard handle it
    if (isStepInWizard) {
      return true;
    }
    
    // If step is not in wizard, execute standard logic
    
    // Update step status
    stepStore.updateStep(stepId, {
      status: "skipped"
    });
    
    // Get task
    const taskId = step.taskId;
    const task = taskStore.getTaskById(taskId);
    
    if (!task) {
      console.error(`Could not find task for step ${stepId}`);
      return false;
    }
    
    // If this was the current step, move to next
    if (task.currentStepId === stepId) {
      const nextStep = stepStore.getNextStep(taskId, stepId);
      
      if (nextStep) {
        // Move to next step
        taskStore.updateTask(taskId, { 
          currentStepId: nextStep.id 
        });
      } else {
        // No more steps, check if all steps are complete or skipped
        const allCompleted = stepStore.areAllStepsCompleted(taskId);
        
        if (allCompleted) {
          // Mark task as completed
          taskStore.updateTaskStatus(taskId, 'completed');
        }
      }
    }
    
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
    return stepStore.reorderSteps(taskId, stepIds);
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