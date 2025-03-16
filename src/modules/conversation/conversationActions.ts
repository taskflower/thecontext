// src/modules/conversation/conversationActions.ts

import { SetFn } from "../typesActioss";


export const createConversationActions = (set: SetFn) => ({
  addToConversation: (payload: { role: string; message: string }) =>
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