// src/modules/flowPlayer/types.ts
import { FlowNode } from '../flow/types';

export interface FlowPlayerContext {
  isPlaying: boolean;
  canPlay: boolean;
  currentNode: FlowNode | null;
  currentNodeIndex: number;
  flowPath: FlowNode[];
  processedMessage: string | null;

  startFlow: () => void;
  stopFlow: () => void;
  nextNode: () => void;
  previousNode: () => void;
  updateUserMessage: (value: string) => void;
  setProcessedMessage: (processed: string | null) => void;
}