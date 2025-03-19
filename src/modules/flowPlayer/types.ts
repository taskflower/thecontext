// src/modules/flowPlayer/types.ts
import { FlowNode } from '../flow/types';

export interface FlowPlayerContext {
  isPlaying: boolean;
  canPlay: boolean;
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  processedMessage: string | null;
  userMessage: string;

  startFlow: () => void;
  stopFlow: () => void;
  nextNode: (userMsg?: string) => void;
  previousNode: () => void;
  resetFlow: () => void;
  updateUserMessage: (value: string) => void;
  setProcessedMessage: (processed: string | null) => void;
}

// Konteksty dla procesorów wiadomości
export interface UserMessageContext {
  message: string;
  onChange: (message: string) => void;
  currentNode: FlowNode | null;
  flowState: FlowPlayerContext;
}

export interface AssistantMessageContext {
  message: string | null;
  isProcessing: boolean;
  currentNode: FlowNode | null;
  flowState: FlowPlayerContext;
}

export interface FlowControlsContext {
  isPlaying: boolean;
  canPlay: boolean;
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  
  startFlow: () => void;
  stopFlow: () => void;
  nextNode: (userMsg?: string) => void;
  previousNode: () => void;
  resetFlow: () => void;
}

