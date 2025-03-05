/* eslint-disable @typescript-eslint/no-explicit-any */
// src/store/wizardStore.types.ts
import { Step } from "@/types";

export interface WizardState {
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