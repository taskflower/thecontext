// src/modules/history/historyStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import { BaseNode } from "../flow/types";

export interface ConversationHistoryEntry {
  id: string;
  scenarioId: string;
  scenarioName: string;
  timestamp: number;
  steps: ConversationStep[];
}

export interface ConversationStep {
  nodeId: string;
  nodeLabel: string;
  assistantMessage?: string;
  userMessage?: string;
  pluginKey?: string | null;
}

export interface HistoryState {
  conversations: ConversationHistoryEntry[];
  
  // Actions
  saveConversation: (scenarioId: string, scenarioName: string, steps: BaseNode[]) => string;
  getConversation: (historyId: string) => ConversationHistoryEntry | undefined;
  deleteConversation: (historyId: string) => void;
  clearHistory: () => void;
}

const useHistoryStore = create<HistoryState>()(
  devtools(
    persist(
      (set, get) => ({
      conversations: [],
      
      saveConversation: (scenarioId, scenarioName, steps) => {
        const historyId = uuidv4();
        
        const historySteps = steps.map(node => ({
          nodeId: node.id,
          nodeLabel: node.label,
          assistantMessage: node.assistantMessage,
          userMessage: node.userPrompt,
          pluginKey: node.pluginKey
        }));
        
        // Debug: Verify each step has userMessage if applicable
        console.log("Saving conversation steps:", historySteps);
        
        const historyEntry: ConversationHistoryEntry = {
          id: historyId,
          scenarioId,
          scenarioName,
          timestamp: Date.now(),
          steps: historySteps
        };
        
        console.log("Full history entry being saved:", historyEntry);
        
        set(state => ({
          conversations: [historyEntry, ...state.conversations]
        }));
        
        return historyId;
      },
      
      getConversation: (historyId) => {
        return get().conversations.find(conv => conv.id === historyId);
      },
      
      deleteConversation: (historyId) => {
        set(state => ({
          conversations: state.conversations.filter(conv => conv.id !== historyId)
        }));
      },
      
      clearHistory: () => {
        set({ conversations: [] });
      }
    }),
    { name: 'flow-conversation-history' }
    ),
    { name: 'history-store' }
  )
);

export default useHistoryStore;