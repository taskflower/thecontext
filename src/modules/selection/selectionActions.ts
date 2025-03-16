// src/modules/selection/selectionActions.ts
export const createSelectionActions = (set) => ({
    clearSelection: () =>
      set((state) => {
        state.selected.node = undefined;
        state.selected.edge = undefined;
        state.stateVersion++;
      }),
  });