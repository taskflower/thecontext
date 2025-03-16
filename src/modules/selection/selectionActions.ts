// src/modules/selection/selectionActions.ts

import { SetFn } from "../typesActioss";


export const createSelectionActions = (set: SetFn) => ({
  clearSelection: () =>
    set((state) => {
      state.selected.node = undefined;
      state.selected.edge = undefined;
      state.stateVersion++;
    }),
});