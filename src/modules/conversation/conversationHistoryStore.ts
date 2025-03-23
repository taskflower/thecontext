/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface ConversationMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  nodeId?: string;
  metadata?: Record<string, any>;
}

export interface ConversationSession {
  id: string;
  name: string;
  scenarioId: string;
  messages: ConversationMessage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ConversationHistoryState {
  sessions: ConversationSession[];
  activeSessionId: string | null;
  
  // Gettery
  getActiveSession: () => ConversationSession | null;
  getSessionById: (sessionId: string) => ConversationSession | null;
  getSessionsForScenario: (scenarioId: string) => ConversationSession[];
  
  // Akcje dla sesji
  createSession: (scenarioId: string, name?: string) => string;
  deleteSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string) => void;
  
  // Akcje dla wiadomości
  addMessage: (message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  updateMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  
  // Import/export wiadomości z węzłów
  importMessagesFromNodes: (nodes: Array<{ id: string, prompt?: string, message?: string }>, scenarioId: string) => void;
}

export const useConversationHistoryStore = create<ConversationHistoryState>()(
  immer((set, get) => ({
    sessions: [],
    activeSessionId: null,
    
    getActiveSession: () => {
      const state = get();
      if (!state.activeSessionId) return null;
      return state.sessions.find(s => s.id === state.activeSessionId) || null;
    },
    
    getSessionById: (sessionId: string) => {
      return get().sessions.find(s => s.id === sessionId) || null;
    },
    
    getSessionsForScenario: (scenarioId: string) => {
      return get().sessions.filter(s => s.scenarioId === scenarioId);
    },
    
    createSession: (scenarioId: string, name?: string) => {
      const sessionId = `session-${Date.now()}`;
      const sessionName = name || `Sesja ${get().sessions.length + 1}`;
      
      set(state => {
        state.sessions.push({
          id: sessionId,
          name: sessionName,
          scenarioId: scenarioId,
          messages: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
        state.activeSessionId = sessionId;
      });
      
      return sessionId;
    },
    
    deleteSession: (sessionId: string) => {
      set(state => {
        const sessionIndex = state.sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex !== -1) {
          state.sessions.splice(sessionIndex, 1);
          
          // Resetuj aktywną sesję jeśli usunięto aktywną
          if (state.activeSessionId === sessionId) {
            state.activeSessionId = state.sessions.length > 0 ? state.sessions[0].id : null;
          }
        }
      });
    },
    
    setActiveSession: (sessionId: string) => {
      set(state => {
        if (state.sessions.some(s => s.id === sessionId)) {
          state.activeSessionId = sessionId;
        }
      });
    },
    
    addMessage: (message) => {
      const session = get().getActiveSession();
      if (!session) return;
      
      set(state => {
        const sessionIndex = state.sessions.findIndex(s => s.id === state.activeSessionId);
        if (sessionIndex !== -1) {
          state.sessions[sessionIndex].messages.push({
            id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: new Date(),
            ...message
          });
          state.sessions[sessionIndex].updatedAt = new Date();
        }
      });
    },
    
    updateMessage: (messageId: string, content: string) => {
      const session = get().getActiveSession();
      if (!session) return;
      
      set(state => {
        const sessionIndex = state.sessions.findIndex(s => s.id === state.activeSessionId);
        if (sessionIndex !== -1) {
          const messageIndex = state.sessions[sessionIndex].messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            state.sessions[sessionIndex].messages[messageIndex].content = content;
            state.sessions[sessionIndex].updatedAt = new Date();
          }
        }
      });
    },
    
    deleteMessage: (messageId: string) => {
      const session = get().getActiveSession();
      if (!session) return;
      
      set(state => {
        const sessionIndex = state.sessions.findIndex(s => s.id === state.activeSessionId);
        if (sessionIndex !== -1) {
          const messageIndex = state.sessions[sessionIndex].messages.findIndex(m => m.id === messageId);
          if (messageIndex !== -1) {
            state.sessions[sessionIndex].messages.splice(messageIndex, 1);
            state.sessions[sessionIndex].updatedAt = new Date();
          }
        }
      });
    },
    
    importMessagesFromNodes: (nodes, scenarioId: string) => {
      // Stwórz nową sesję dla importu
      const sessionId = get().createSession(scenarioId, `Import ${new Date().toLocaleString()}`);
      const sessionIndex = get().sessions.findIndex(s => s.id === sessionId);
      
      if (sessionIndex === -1) return;
      
      set(state => {
        const messages: ConversationMessage[] = [];
        
        // Konwertuj węzły na wiadomości w porządku chronologicznym
        nodes.forEach(node => {
          // Dodaj wiadomość asystenta jeśli istnieje
          if (node.message) {
            messages.push({
              id: `msg-assistant-${node.id}`,
              type: 'assistant',
              content: node.message,
              timestamp: new Date(),
              nodeId: node.id
            });
          }
          
          // Dodaj wiadomość użytkownika jeśli istnieje
          if (node.prompt) {
            messages.push({
              id: `msg-user-${node.id}`,
              type: 'user',
              content: node.prompt,
              timestamp: new Date(new Date().getTime() + 1000), // 1 sekundę później
              nodeId: node.id
            });
          }
        });
        
        // Sortuj wiadomości chronologicznie (choć już powinny być w odpowiedniej kolejności)
        messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // Przypisz wiadomości do sesji
        state.sessions[sessionIndex].messages = messages;
      });
    }
  }))
);