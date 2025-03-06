/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/stepStore.types.ts
import { Step } from "@/types";

export interface StepState {
  // State
  steps: Record<string, Step[]>;
  
  // Actions
  addStep: (taskId: string, step: Omit<Step, "id" | "taskId" | "order">) => string;
  updateStep: (stepId: string, updates: Partial<Step>) => void;
  deleteStep: (stepId: string) => boolean;
  reorderSteps: (taskId: string, newOrder: string[]) => boolean;
  
  // Helpers
  getTaskSteps: (taskId: string) => Step[];
  getStepById: (stepId: string) => Step | undefined;
  getNextStep: (taskId: string, currentStepId: string) => Step | undefined;
  getPreviousStep: (taskId: string, currentStepId: string) => Step | undefined;
  getTaskIdForStep: (stepId: string) => string | undefined;
  areAllStepsCompleted: (taskId: string) => boolean;
}