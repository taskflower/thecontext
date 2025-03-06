/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { persist, createJSONStorage } from 'zustand/middleware';
import { Step } from "@/types";
import { StepState } from "./stepStore.types";

/**
 * Step Store - odpowiada za zarządzanie stanem kroków zadań
 * Zawiera tylko podstawowe operacje na danych, bez logiki biznesowej
 */
export const useStepStore = create<StepState>()(
  persist(
    (set, get) => ({
      steps: {},
      
      // Dodanie nowego kroku do zadania
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
      
      // Aktualizacja kroku
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
      
      // Pobieranie kroków dla zadania
      getTaskSteps: (taskId) => {
        return get().steps[taskId] || [];
      },
      
      // Pobieranie kroku po ID
      getStepById: (stepId) => {
        let foundStep: Step | undefined;
        
        Object.values(get().steps).forEach(taskSteps => {
          const step = taskSteps.find(s => s.id === stepId);
          if (step) foundStep = step;
        });
        
        return foundStep;
      },
      
      // Pobieranie następnego kroku
      getNextStep: (taskId, currentStepId) => {
        const taskSteps = get().getTaskSteps(taskId).sort((a, b) => a.order - b.order);
        const currentIndex = taskSteps.findIndex(step => step.id === currentStepId);
        
        if (currentIndex < 0 || currentIndex >= taskSteps.length - 1) return undefined;
        return taskSteps[currentIndex + 1];
      },
      
      // Pobieranie poprzedniego kroku
      getPreviousStep: (taskId, currentStepId) => {
        const taskSteps = get().getTaskSteps(taskId).sort((a, b) => a.order - b.order);
        const currentIndex = taskSteps.findIndex(step => step.id === currentStepId);
        
        if (currentIndex <= 0) return undefined;
        return taskSteps[currentIndex - 1];
      },
      
      // Zwracanie informacji o zadaniu powiązanym z danym krokiem
      getTaskIdForStep: (stepId) => {
        const step = get().getStepById(stepId);
        return step?.taskId;
      },
      
      // Sprawdzanie czy wszystkie kroki zadania są ukończone
      areAllStepsCompleted: (taskId) => {
        const steps = get().getTaskSteps(taskId);
        return steps.length > 0 && steps.every(step => 
          step.status === 'completed' || step.status === 'skipped'
        );
      },
      
      // Usuwanie kroku
      deleteStep: (stepId) => {
        const step = get().getStepById(stepId);
        if (!step) return false;
        
        set((state) => {
          const taskId = step.taskId;
          const taskSteps = state.steps[taskId] || [];
          
          // Usuń krok
          const updatedSteps = taskSteps.filter(s => s.id !== stepId);
          
          // Zaktualizuj kolejność
          const reorderedSteps = updatedSteps
            .sort((a, b) => a.order - b.order)
            .map((step, index) => ({ ...step, order: index + 1 }));
          
          return {
            steps: {
              ...state.steps,
              [taskId]: reorderedSteps
            }
          };
        });
        
        return true;
      },
      
      // Zmiana kolejności kroków
      reorderSteps: (taskId, newOrder) => {
        const taskSteps = get().getTaskSteps(taskId);
        if (!taskSteps.length) return false;
        
        set((state) => {
          const reorderedSteps = newOrder.map((stepId, index) => {
            const step = taskSteps.find(s => s.id === stepId);
            if (!step) return null;
            return { ...step, order: index + 1 };
          }).filter(Boolean) as Step[];
          
          if (reorderedSteps.length !== taskSteps.length) return state;
          
          return {
            steps: {
              ...state.steps,
              [taskId]: reorderedSteps
            }
          };
        });
        
        return true;
      }
    }),
    {
      name: 'app-steps-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        steps: state.steps
      }),
    }
  )
);