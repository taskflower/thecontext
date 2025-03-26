// src/modules/flow/types.ts
import { Edge, FlowNode } from "../graph/types";

// Stan tymczasowego flow
export interface FlowSession {
  isPlaying: boolean;
  currentStepIndex: number;
  temporarySteps: FlowNode[];
}

export interface StepModalProps {
  onClose: () => void;
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
  // saveChanges=true - zapisz do historii i wyczyść sesję
  // saveChanges=false - zachowaj sesję do kontynuacji
  stopFlowSession: (saveChanges?: boolean) => void;
  resetFlowSession: () => void;
  nextStep: () => void;
  prevStep: () => void;
  
  
  // Modyfikacja tymczasowych danych
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => void;
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => void;
  
  // Tylko dla zapewnienia zgodności wstecznej
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => void;
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => void;
}