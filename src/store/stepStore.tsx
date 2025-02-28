/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { Step } from "@/types";
import { useDataStore } from "./dataStore";

interface StepState {
  // State
  steps: Record<string, Step[]>;
  
  // Actions
  addStep: (taskId: string, step: Omit<Step, "id" | "taskId" | "order">) => string;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  completeStep: (stepId: string, result?: Record<string, any>) => void;
  skipStep: (stepId: string) => void;
  
  // Helpers
  getTaskSteps: (taskId: string) => Step[];
  getStepById: (stepId: string) => Step | undefined;
  getNextStep: (taskId: string, currentStepId: string) => Step | undefined;
  getPreviousStep: (taskId: string, currentStepId: string) => Step | undefined;
}

export const useStepStore = create<StepState>((set, get) => ({
  steps: {},
  
  addStep: (taskId, stepData) => {
    const taskSteps = get().steps[taskId] || [];
    const newStep: Step = {
      ...stepData,
      id: `step-${taskId}-${Date.now()}`,
      taskId,
      order: taskSteps.length + 1,
      status: 'pending',
      result: null
    };
    
    set((state) => ({
      steps: {
        ...state.steps,
        [taskId]: [...taskSteps, newStep]
      }
    }));
    
    return newStep.id;
  },
  
  updateStep: (stepId, updates) => {
    set((state) => {
      const newSteps = { ...state.steps };
      
      Object.keys(newSteps).forEach(taskId => {
        newSteps[taskId] = newSteps[taskId].map(step => 
          step.id === stepId ? { ...step, ...updates } : step
        );
      });
      
      return { steps: newSteps };
    });
  },
  
  completeStep: (stepId, result = {}) => {
    const step = get().getStepById(stepId);
    if (!step) return;
    
    get().updateStep(stepId, { 
      status: 'completed', 
      result: { ...step.result, ...result } 
    });
    
    // Auto-advance to next step in data store if needed
    const dataStore = useDataStore.getState();
    const task = dataStore.tasks.find(t => t.id === step.taskId);
    
    if (task && task.currentStepId === stepId) {
      const nextStep = get().getNextStep(step.taskId, stepId);
      if (nextStep) {
        dataStore.updateTask(step.taskId, { currentStepId: nextStep.id });
        // Set next step to in-progress
        get().updateStep(nextStep.id, { status: 'in-progress' });
      } else {
        // No more steps, mark task as completed
        dataStore.updateTaskStatus(step.taskId, 'completed');
      }
    }
  },
  
  skipStep: (stepId) => {
    get().updateStep(stepId, { status: 'skipped' });
    
    const step = get().getStepById(stepId);
    if (!step) return;
    
    // Auto-advance to next step if needed
    const dataStore = useDataStore.getState();
    const task = dataStore.tasks.find(t => t.id === step.taskId);
    
    if (task && task.currentStepId === stepId) {
      const nextStep = get().getNextStep(step.taskId, stepId);
      if (nextStep) {
        dataStore.updateTask(step.taskId, { currentStepId: nextStep.id });
      }
    }
  },
  
  getTaskSteps: (taskId) => {
    return get().steps[taskId] || [];
  },
  
  getStepById: (stepId) => {
    let foundStep: Step | undefined;
    
    Object.values(get().steps).forEach(taskSteps => {
      const step = taskSteps.find(s => s.id === stepId);
      if (step) foundStep = step;
    });
    
    return foundStep;
  },
  
  getNextStep: (taskId, currentStepId) => {
    const taskSteps = get().getTaskSteps(taskId).sort((a, b) => a.order - b.order);
    const currentIndex = taskSteps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex < 0 || currentIndex >= taskSteps.length - 1) return undefined;
    return taskSteps[currentIndex + 1];
  },
  
  getPreviousStep: (taskId, currentStepId) => {
    const taskSteps = get().getTaskSteps(taskId).sort((a, b) => a.order - b.order);
    const currentIndex = taskSteps.findIndex(step => step.id === currentStepId);
    
    if (currentIndex <= 0) return undefined;
    return taskSteps[currentIndex - 1];
  }
}));