// src/modules/flow/types.ts
import { Edge, FlowNode } from "../graph/types";
import { DialogTemplate } from "./components/interfaces";

// Stan tymczasowego flow
export interface FlowSession {
  isPlaying: boolean;
  currentStepIndex: number;
  temporarySteps: FlowNode[];
}

export interface StepModalProps {
  onClose: () => void;
  template?: DialogTemplate; // Wskazuje, który szablon interfejsu zastosować
}

export interface FlowActions {
  // Pobieranie danych ze scenariusza
  getActiveScenarioData: () => {
    nodes: FlowNode[];
    edges: Edge[];
  };
  
  // Obliczanie ścieżki flow
  calculateFlowPath: () => FlowNode[];
  
  // Zarządzanie sesją flow
  startFlowSession: () => void;
  stopFlowSession: (saveChanges?: boolean) => void;
  resetFlowSession: () => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Modyfikacja tymczasowych danych
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => void;
  
  // Aktualizacja oryginalnych lub tymczasowych danych (zależnie od stanu sesji)
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => void;
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => void;
}