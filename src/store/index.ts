// store/index.ts - uproszczona wersja
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { NodeManager } from "../../raw_modules/nodes-module/src";
import { AppStore } from "./types";

// Importujemy slice'y
import createUISlice from "./slices/uiStore";
import createWorkspaceSlice from "./slices/workspaceStore";
import createNodeSlice from "./slices/nodeStore";
import createFlowSlice from "./slices/flowStore";
import createContextSlice from "./slices/contextStore";

// Tworzymy store
const useStore = create<AppStore>()(
  devtools((...a) => ({
    // Wspólne elementy stanu
    nodeManager: new NodeManager(),

    // Łączymy wszystkie slice'y
    ...createUISlice(...a),
    ...createWorkspaceSlice(...a),
    ...createNodeSlice(...a),
    ...createFlowSlice(...a),
    ...createContextSlice(...a),
  }))
);

// Eksportujemy selektory dla poprawy wydajności
export const useUI = () =>
  useStore((state) => ({
    view: state.view,
    selectedIds: state.selectedIds,
  }));

export const useFlowNode = () => useStore((state) => state.currentFlowNode);
export const useFlowState = () => useStore((state) => state.flowState);
export const useSelectedIds = () => useStore((state) => state.selectedIds);

// Eksportujemy główny hook
export default useStore;