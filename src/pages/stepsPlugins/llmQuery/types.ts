/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmQuery/types.ts
import { ConversationItem } from '@/types';
import { ReferenceData } from './service/ReferenceService';


// Renamed to avoid conflicts with the built-in Request type
export interface LLMRequestOptions {
  prompt: string;
  authToken?: string | null;
  conversationData?: ConversationItem[];
}

export interface LLMResponse {
  content?: string;
  messages?: ConversationItem[];
  [key: string]: any;
}

export interface ProcessQueryResult {
  result: LLMResponse;
  fullResult: any;
  newConversationItems: ConversationItem[];
}

// Re-export ReferenceData for convenience
export type { ReferenceData };