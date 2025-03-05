/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/wizardStore.ts
import { create } from 'zustand';
import { useTaskStore } from '@/store/taskStore';
import { useStepStore } from '@/store/stepStore';

interface WizardState {
  showWizard: boolean;
  activeTaskId: string | null;
  activeStepId: string | null;
  
  // Actions
  openWizard: (taskId: string, stepId?: string | null) => void;
  closeWizard: () => void;
  setActiveTask: (taskId: string | null) => void;
  setActiveStep: (stepId: string | null) => void;
  moveToNextStep: () => void;
  moveToPreviousStep: () => void;
  completeCurrentStep: (result?: Record<string, any>) => void;
  skipCurrentStep: () => void;
}

export const useWizardStore = create<WizardState>((set, get) => ({
  showWizard: false,
  activeTaskId: null,
  activeStepId: null,
  
  openWizard: (taskId, stepId = null) => {
    console.log(`WizardStore: Opening wizard for task ${taskId}, step ${stepId || 'auto'}`);
    
    const taskStore = useTaskStore.getState();
    const stepStore = useStepStore.getState();
    
    // Get task and determine which step to start with
    const task = taskStore.tasks.find(t => t.id === taskId);
    
    if (!task) {
      console.error(`WizardStore: Task ${taskId} not found`);
      return;
    }
    
    // Get all steps for this task
    const steps = stepStore.getTaskSteps(taskId).sort((a, b) => a.order - b.order);
    
    if (steps.length === 0) {
      console.error(`WizardStore: No steps found for task ${taskId}`);
      return;
    }
    
    // Determine which step to show
    let startStepId: string | null = null;
    
    if (stepId) {
      // Use provided stepId
      startStepId = stepId;
    } else if (task.currentStepId) {
      // Use task's currentStepId
      startStepId = task.currentStepId;
    } else {
      // Start with the first step
      startStepId = steps[0].id;
      
      // Update task with the current step ID
      taskStore.updateTask(taskId, {
        currentStepId: startStepId,
        status: 'in-progress'
      });
    }
    
    // Set initial state
    set({
      showWizard: true,
      activeTaskId: taskId,
      activeStepId: startStepId
    });
    
    console.log(`WizardStore: Wizard opened with task ${taskId}, step ${startStepId}`);
  },
  
  closeWizard: () => {
    console.log('WizardStore: Closing wizard');
    set({
      showWizard: false
    });
  },
  
  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId });
  },
  
  setActiveStep: (stepId) => {
    set({ activeStepId: stepId });
  },
  
  moveToNextStep: () => {
    const { activeTaskId, activeStepId } = get();
    
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    const steps = stepStore.getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order);
    
    // Find current step index
    const currentIndex = steps.findIndex(s => s.id === activeStepId);
    
    if (currentIndex < 0 || currentIndex >= steps.length - 1) {
      // If we're at the last step, close the wizard and mark the task as completed
      if (currentIndex === steps.length - 1) {
        taskStore.updateTask(activeTaskId, {
          status: 'completed'
        });
        get().closeWizard();
      }
      return;
    }
    
    // Move to the next step
    const nextStep = steps[currentIndex + 1];
    
    // Update task's currentStepId
    taskStore.updateTask(activeTaskId, {
      currentStepId: nextStep.id
    });
    
    set({ activeStepId: nextStep.id });
  },
  
  moveToPreviousStep: () => {
    const { activeTaskId, activeStepId } = get();
    
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    const taskStore = useTaskStore.getState();
    const steps = stepStore.getTaskSteps(activeTaskId).sort((a, b) => a.order - b.order);
    
    // Find current step index
    const currentIndex = steps.findIndex(s => s.id === activeStepId);
    
    if (currentIndex <= 0) return;
    
    // Move to the previous step
    const prevStep = steps[currentIndex - 1];
    
    // Update task's currentStepId
    taskStore.updateTask(activeTaskId, {
      currentStepId: prevStep.id
    });
    
    set({ activeStepId: prevStep.id });
  },
  
  completeCurrentStep: (result) => {
    const { activeTaskId, activeStepId } = get();
    
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    
    // Update step status and result
    stepStore.updateStep(activeStepId, {
      status: 'completed',
      result: result || {}
    });
    
    // Move to the next step
    get().moveToNextStep();
  },
  
  skipCurrentStep: () => {
    const { activeTaskId, activeStepId } = get();
    
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    
    // Mark step as skipped
    stepStore.updateStep(activeStepId, {
      status: 'skipped'
    });
    
    // Move to the next step
    get().moveToNextStep();
  }
}));