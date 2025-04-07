// store/slices/uiStore.ts
import { StateCreator } from 'zustand';
import { AppStore, UIState, UIActions } from '../types';

const createUISlice: StateCreator<
  AppStore,
  [],
  [],
  UIState & UIActions
> = (set, get) => ({
  // Stan początkowy
  view: 'workspaces',
  selectedIds: { workspace: null, scenario: null, node: null },
  
  // Akcje
  setView: (view) => set({ view }),
  
  setSelectedIds: (ids) => set(state => ({
    selectedIds: { ...state.selectedIds, ...ids }
  })),
  
  navigateBack: () => {
    const { view, selectedIds } = get();
    
    switch (view) {
      case 'scenarios': 
        return set({
          selectedIds: { workspace: null, scenario: null, node: null },
          view: 'workspaces'
        });
      case 'flow':
        return set({
          selectedIds: { ...selectedIds, scenario: null, node: null },
          view: 'scenarios'
        });
      case 'nodeEditor':
      case 'contextEditor':
        return set({
          nodeForm: null,
          contextForm: null,
          selectedIds: { ...selectedIds, node: null },
          view: 'flow'
        });
      default:
        return;
    }
  }
});

export default createUISlice;