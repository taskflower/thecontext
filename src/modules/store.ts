// src/modules/store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";
import { AppState } from "./types";
import { initialState } from "./initialState";
import { createWorkspaceActions } from "./workspaces/workspaceActions";
import { createScenarioActions } from "./scenarios/scenarioActions";
import { createNodeActions } from "./nodes/nodeActions";
import { createEdgeActions } from "./edges/edgeActions";
import { createConversationActions } from "./conversation/conversationActions";
import { createSelectionActions } from "./selection/selectionActions";
import { createHelperActions } from "./helper/helperActions";
import { createContextActions } from "./context/contextActions";

// Create store with persist middleware
export const useAppStore = create<AppState>()(
  persist(
    immer((set, get) => ({
      items: initialState.items,
      selected: initialState.selected,
      stateVersion: 0,
      activeTab: "workspace",
      setActiveTab: (tab: string) => set((state) => {
        state.activeTab = tab;
        state.stateVersion++;
      }),
      conversation: initialState.conversation,

      // Combine all actions
      ...createWorkspaceActions(set),
      ...createScenarioActions(set),
      ...createNodeActions(set),
      ...createEdgeActions(set),
      ...createConversationActions(set),
      ...createSelectionActions(set),
      ...createHelperActions(get),
      ...createContextActions(set),
    })),
    {
      name: "flow-builder-storage", // Storage key
      partialize: (state) => ({
        // Only persist these parts of the state
        items: state.items,
        selected: state.selected,
        // Don't persist conversation to save storage space
        // Don't persist stateVersion since it's a local state tracker
      }),
      // Logging dla debugowania
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Store rehydrated:", state);
        }
      }
    }
  )
);