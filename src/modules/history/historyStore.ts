// src/modules/history/historyStore.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

/**
 * Core node structure used in conversations
 */
interface FlowNode {
  id: string;
  label: string;
  assistantMessage?: string;
  userPrompt?: string;
  pluginKey?: string | null;
}

/**
 * Individual step in a conversation history
 */
export interface ConversationStep {
  /** Original node ID from the scenario */
  nodeId: string;
  /** Display label for the node */
  nodeLabel: string;
  /** Assistant's response in this step */
  assistantMessage?: string;
  /** User's input in this step */
  userMessage?: string;
  /** Plugin used in this step, if any */
  pluginKey?: string | null;
}

/**
 * Complete conversation history entry
 */
export interface ConversationHistoryEntry {
  /** Unique ID for this conversation */
  id: string;
  /** ID of the scenario this conversation belongs to */
  scenarioId: string;
  /** Display name of the scenario */
  scenarioName: string;
  /** Timestamp when this conversation was saved */
  timestamp: number;
  /** Steps of the conversation */
  steps: ConversationStep[];
}

/**
 * History store state and actions
 */
export interface HistoryState {
  /** All saved conversations */
  conversations: ConversationHistoryEntry[];
  
  /**
   * Saves a completed flow session to history
   * @param scenarioId ID of the scenario this session belongs to
   * @param scenarioName Display name of the scenario
   * @param steps Flow nodes representing steps in the session
   * @returns ID of the newly created history entry
   */
  saveConversation: (scenarioId: string, scenarioName: string, steps: FlowNode[]) => string;
  
  /**
   * Retrieves a specific conversation by ID
   * @param historyId ID of the conversation to retrieve
   * @returns The conversation history entry or undefined if not found
   */
  getConversation: (historyId: string) => ConversationHistoryEntry | undefined;
  
  /**
   * Deletes a conversation from history
   * @param historyId ID of the conversation to delete
   */
  deleteConversation: (historyId: string) => void;
  
  /**
   * Clears all conversation history
   */
  clearHistory: () => void;
}

/**
 * Store for managing conversation history
 */
const useHistoryStore = create<HistoryState>()(
  devtools(
    persist(
      (set, get) => ({
      conversations: [],
      
      saveConversation: (scenarioId, scenarioName, steps) => {
        const historyId = uuidv4();
        
        // Convert FlowNode objects to ConversationStep objects
        const historySteps = steps.map(node => ({
          nodeId: node.id,
          nodeLabel: node.label,
          assistantMessage: node.assistantMessage,
          userMessage: node.userPrompt,
          pluginKey: node.pluginKey
        }));
        
        // Create the history entry
        const historyEntry: ConversationHistoryEntry = {
          id: historyId,
          scenarioId,
          scenarioName,
          timestamp: Date.now(),
          steps: historySteps
        };
        
        // Add to the beginning of the conversations array
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