// src/modules/flowPlayer/types.ts
import { FlowNode } from '../flow/types';

export interface FlowPlayerState {
  isPlaying: boolean;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  processedMessage: string | null;
}

export interface FlowPlayerActions {
  startFlow: () => void;
  stopFlow: () => void;
  nextNode: () => void;
  previousNode: () => void;
  updateUserMessage: (value: string) => void;
  setProcessedMessage: (message: string) => void;
}

// Combined state and actions
export type FlowPlayerContext = FlowPlayerState & FlowPlayerActions & {
  canPlay: boolean;
  currentNode: FlowNode | null;
};