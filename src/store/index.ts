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
import createPluginSlice from "./slices/pluginStore";

// Tworzymy store
const useStore = create<AppStore>()(
  devtools((...a) => ({
    nodeManager: new NodeManager(),

    ...createUISlice(...a),
    ...createWorkspaceSlice(...a),
    ...createNodeSlice(...a),
    ...createFlowSlice(...a),
    ...createContextSlice(...a),
    ...createPluginSlice(...a),
  }))
);

export default useStore;