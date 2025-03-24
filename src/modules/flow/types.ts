/* eslint-disable @typescript-eslint/no-explicit-any */
import { Edge, FlowNode } from "../graph/types";

export interface StepModalProps {
  steps: any[];
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export interface FlowActions {
  getActiveScenarioData: () => {
    nodes: FlowNode[];
    edges: Edge[];
  };
  
  calculateFlowPath: () => any[];
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => void;
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => void;
}