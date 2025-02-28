/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/wizardStore.tsx - zmodyfikowana wersja

import { create } from "zustand";
import { useStepStore } from "./stepStore";
import { useDataStore } from "./dataStore";
import { Step } from "@/types";

interface WizardState {
  // Stan
  activeTaskId: string | null;
  activeStepId: string | null;
  showWizard: boolean;
  
  // Akcje
  openWizard: (taskId: string, stepId?: string) => void;
  closeWizard: () => void;
  moveToNextStep: () => void;
  moveToPreviousStep: () => void;
  completeCurrentStep: (result?: Record<string, any>) => void;
  skipCurrentStep: () => void;
  setActiveTask: (taskId: string | null) => void;
  
  // Pomocnicy
  getCurrentStep: () => Step | null;
}

// Uaktualniona wersja useWizardStore
export const useWizardStore = create<WizardState>((set, get) => ({
  activeTaskId: null,
  activeStepId: null,
  showWizard: false,
  
  // Ta funkcja powinna być używana przez wszystkie komponenty
  setActiveTask: (taskId) => {
    console.log("wizardStore.setActiveTask:", taskId);
    
    if (!taskId) {
      set({
        activeTaskId: null,
        activeStepId: null
      });
      return;
    }
    
    const stepStore = useStepStore.getState();
    const dataStore = useDataStore.getState();
    
    const task = dataStore.tasks.find(t => t.id === taskId);
    if (!task) {
      console.error("Nie znaleziono zadania:", taskId);
      return;
    }
    
    let stepId = task.currentStepId;
    
    if (!stepId) {
      const steps = stepStore.getTaskSteps(taskId).sort((a, b) => a.order - b.order);
      stepId = steps[0]?.id || null;
    }
    
    console.log("Ustawiam activeTaskId:", taskId, "activeStepId:", stepId);
    set({
      activeTaskId: taskId,
      activeStepId: stepId
    });
  },
  
  // Pozostałe funkcje pozostają bez zmian...
  openWizard: (taskId, stepId) => {
    const stepStore = useStepStore.getState();
    const dataStore = useDataStore.getState();
    
    const task = dataStore.tasks.find(t => t.id === taskId);
    if (!task) return;
    
    let targetStepId = stepId;
    
    if (!targetStepId) {
      if (task.currentStepId) {
        targetStepId = task.currentStepId;
      } else {
        const taskSteps = stepStore.getTaskSteps(taskId).sort((a, b) => a.order - b.order);
        targetStepId = taskSteps[0]?.id;
      }
    }
    
    if (task.currentStepId !== targetStepId && targetStepId) {
      dataStore.updateTask(taskId, { currentStepId: targetStepId });
      
      const step = stepStore.getStepById(targetStepId);
      if (step && step.status === 'pending') {
        stepStore.updateStep(targetStepId, { status: 'in-progress' });
      }
    }
    
    set({
      activeTaskId: taskId,
      activeStepId: targetStepId || null,
      showWizard: true
    });
  },
  
  closeWizard: () => {
    set({
      showWizard: false
    });
  },
  
  moveToNextStep: () => {
    const { activeTaskId, activeStepId } = get();
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    const nextStep = stepStore.getNextStep(activeTaskId, activeStepId);
    
    if (nextStep) {
      const dataStore = useDataStore.getState();
      dataStore.updateTask(activeTaskId, { currentStepId: nextStep.id });
      
      if (nextStep.status === 'pending') {
        stepStore.updateStep(nextStep.id, { status: 'in-progress' });
      }
      
      set({ activeStepId: nextStep.id });
    }
  },
  
  moveToPreviousStep: () => {
    const { activeTaskId, activeStepId } = get();
    if (!activeTaskId || !activeStepId) return;
    
    const stepStore = useStepStore.getState();
    const prevStep = stepStore.getPreviousStep(activeTaskId, activeStepId);
    
    if (prevStep) {
      const dataStore = useDataStore.getState();
      dataStore.updateTask(activeTaskId, { currentStepId: prevStep.id });
      set({ activeStepId: prevStep.id });
    }
  },
  
  completeCurrentStep: (result) => {
    const { activeStepId } = get();
    if (!activeStepId) return;
    
    const stepStore = useStepStore.getState();
    stepStore.completeStep(activeStepId, result);
    
    const step = stepStore.getStepById(activeStepId);
    if (step) {
      const nextStep = stepStore.getNextStep(step.taskId, activeStepId);
      if (nextStep) {
        set({ activeStepId: nextStep.id });
      } else {
        get().closeWizard();
      }
    }
  },
  
  skipCurrentStep: () => {
    const { activeStepId } = get();
    if (!activeStepId) return;
    
    const stepStore = useStepStore.getState();
    stepStore.skipStep(activeStepId);
    
    const step = stepStore.getStepById(activeStepId);
    if (step) {
      const nextStep = stepStore.getNextStep(step.taskId, activeStepId);
      if (nextStep) {
        set({ activeStepId: nextStep.id });
      } else {
        get().closeWizard();
      }
    }
  },
  
  getCurrentStep: () => {
    const { activeStepId } = get();
    if (!activeStepId) return null;
    
    const stepStore = useStepStore.getState();
    const step = stepStore.getStepById(activeStepId);
    return step || null;
  }
}));