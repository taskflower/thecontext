// src/modules/flow/types.ts
import type { Edge, FlowNode } from "../graph/types";
import type { DialogTemplate } from "./components/interfaces";

/**
 * Represents the state of an active flow session
 */
export interface FlowSession {
  /** Whether the flow is currently playing/active */
  isPlaying: boolean;
  /** Index of the current step in the flow */
  currentStepIndex: number;
  /** Temporary copies of nodes used during the session */
  temporarySteps: FlowNode[];
}

/**
 * Props for the StepModal component
 */
export interface StepModalProps {
  /** Callback when modal is closed */
  onClose: () => void;
  /** Template to use for displaying the step dialog */
  template?: DialogTemplate;
}

/**
 * Defines all actions related to flow management
 */
export interface FlowActions {
  /**
   * Retrieves current scenario data
   * @returns Object containing nodes and edges from active scenario
   */
  getActiveScenarioData: () => {
    nodes: FlowNode[];
    edges: Edge[];
  };
  
  /**
   * Calculates ordered path through flow nodes
   * @returns Ordered array of nodes representing the flow path
   */
  calculateFlowPath: () => FlowNode[];
  
  /**
   * Session management
   */
  /** Starts a new flow session or resumes an existing one */
  startFlowSession: () => void;
  /** Stops current flow session and optionally saves changes */
  stopFlowSession: (saveChanges?: boolean) => void;
  /** Resets the current flow session */
  resetFlowSession: () => void;
  /** Advances to the next step in the flow */
  nextStep: () => void;
  /** Returns to the previous step in the flow */
  prevStep: () => void;
  
  /**
   * Updates to temporary nodes during a session
   */
  /** Updates user prompt for a temporary node */
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => void;
  /** Updates assistant message for a temporary node */
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => void;
  
  /**
   * Smart updates that target either temporary or original nodes 
   * based on session state
   */
  /** Updates assistant message for a node */
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => void;
  /** Updates user prompt for a node */
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => void;
}