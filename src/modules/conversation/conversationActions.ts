// src/modules/conversation/conversationActions.ts
export const createConversationActions = (set) => ({
    addToConversation: (payload) =>
      set((state) => {
        state.conversation.push({
          role: payload.role,
          message: payload.message
        });
        state.stateVersion++;
      }),
      
    clearConversation: () =>
      set((state) => {
        state.conversation = [];
        state.stateVersion++;
      }),
  });