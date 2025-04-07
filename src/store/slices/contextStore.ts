// store/slices/contextStore.ts
import { StateCreator } from 'zustand';
import { AppStore, ContextState, ContextActions, ContextItem } from '../types';

const createContextSlice: StateCreator<
  AppStore,
  [],
  [],
  ContextState & ContextActions
> = set => ({
  // Stan początkowy
  contextItems: [],
  contextForm: null,
  
  // Akcje
  editContext: () => set(state => ({
    contextForm: [...state.contextItems],
    view: 'contextEditor'
  })),
  
  saveContext: () => set(state => {
    if (!state.contextForm) return state;
    
    return {
      contextItems: [...state.contextForm],
      contextForm: null,
      view: 'flow'
    };
  }),
  
  updateContextForm: (items: ContextItem[]) => set({ contextForm: items })
});

export default createContextSlice;