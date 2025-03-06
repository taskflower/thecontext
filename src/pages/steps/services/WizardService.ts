// src/pages/steps/services/WizardService.ts
import { useStepStore, useTaskStore, useWizardStore } from "@/store";
import stepService from "./StepService";

/**
 * WizardService provides business logic for workflow wizard operations
 * to coordinate the execution of task steps in a controlled environment.
 */
class WizardService {
  /**
   * Opens the wizard for a specific task and optionally focuses on a specific step
   * @param taskId ID of the task to open in the wizard
   * @param stepId Optional step ID to focus on
   * @returns Success indicator
   */
  openWizard(taskId: string, stepId?: string): boolean {
    const { getTaskById } = useTaskStore.getState();
    const { getTaskSteps } = useStepStore.getState();
    const { openWizard } = useWizardStore.getState();
    
    // Validate task
    const task = getTaskById(taskId);
    if (!task) {
      console.error(`WizardService: Task ${taskId} not found`);
      return false;
    }
    
    // Get steps
    const steps = getTaskSteps(taskId);
    if (steps.length === 0) {
      console.error(`WizardService: No steps found for task ${taskId}`);
      return false;
    }
    
    // Determine which step to focus on
    let targetStepId = stepId;
    
    if (!targetStepId) {
      // If no step specified and task has a current step, use that
      if (task.currentStepId) {
        targetStepId = task.currentStepId;
      } else {
        // Otherwise use the first step
        targetStepId = steps.sort((a, b) => a.order - b.order)[0].id;
        
        // Update task with current step
        const { updateTask } = useTaskStore.getState();
        updateTask(taskId, {
          currentStepId: targetStepId,
          status: 'in-progress'
        });
      }
    }
    
    // Open wizard
    openWizard(taskId, targetStepId);
    return true;
  }
  
  /**
   * Moves to the next step in the wizard
   * @returns Success indicator
   */
  moveToNextStep(): boolean {
    const wizardStore = useWizardStore.getState();
    const { activeTaskId, activeStepId } = wizardStore;
    
    if (!activeTaskId || !activeStepId) {
      return false;
    }
    
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    const nextStep = stepStore.getNextStep(activeTaskId, activeStepId);
    
    if (!nextStep) {
      // No more steps, close the wizard
      wizardStore.closeWizard();
      
      // Check if all steps are completed
      if (stepStore.areAllStepsCompleted(activeTaskId)) {
        taskStore.updateTaskStatus(activeTaskId, 'completed');
      }
      
      return true;
    }
    
    // Update task's current step
    taskStore.updateTask(activeTaskId, {
      currentStepId: nextStep.id
    });
    
    // Update wizard's active step
    wizardStore.setActiveStep(nextStep.id);
    
    return true;
  }
  
  /**
   * Moves to the previous step in the wizard
   * @returns Success indicator
   */
  moveToPreviousStep(): boolean {
    const wizardStore = useWizardStore.getState();
    const { activeTaskId, activeStepId } = wizardStore;
    
    if (!activeTaskId || !activeStepId) {
      return false;
    }
    
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    const prevStep = stepStore.getPreviousStep(activeTaskId, activeStepId);
    
    if (!prevStep) {
      // No previous step
      return false;
    }
    
    // Update task's current step
    taskStore.updateTask(activeTaskId, {
      currentStepId: prevStep.id
    });
    
    // Update wizard's active step
    wizardStore.setActiveStep(prevStep.id);
    
    return true;
  }
  
  /**
   * Completes the current step in the wizard
   * @param result Optional result data for the step
   * @returns Success indicator
   */
  completeCurrentStep(result?: Record<string, any>): boolean {
    const { activeTaskId, activeStepId } = useWizardStore.getState();
    
    if (!activeTaskId || !activeStepId) {
      return false;
    }
    
    // Use stepService to complete the step
    const success = stepService.completeStep(activeStepId, result);
    
    if (success) {
      // Move to the next step
      this.moveToNextStep();
    }
    
    return success;
  }
  
  /**
   * Skips the current step in the wizard
   * @returns Success indicator
   */
  skipCurrentStep(): boolean {
    const { activeTaskId, activeStepId } = useWizardStore.getState();
    
    if (!activeTaskId || !activeStepId) {
      return false;
    }
    
    // Use stepService to skip the step
    const success = stepService.skipStep(activeStepId);
    
    if (success) {
      // Move to the next step
      this.moveToNextStep();
    }
    
    return success;
  }
}

// Create and export an instance as default
const wizardService = new WizardService();
export default wizardService;