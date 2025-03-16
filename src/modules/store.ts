// src/modules/store.ts
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
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

// Stwórz store z odpowiednio typowanymi parametrami
export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    items: initialState.items,
    selected: initialState.selected,
    stateVersion: 0,
    conversation: initialState.conversation,

    // Połącz wszystkie akcje
    ...createWorkspaceActions(set),
    ...createScenarioActions(set),
    ...createNodeActions(set),
    ...createEdgeActions(set),
    ...createConversationActions(set),
    ...createSelectionActions(set),
    ...createHelperActions(get),
    ...createContextActions(set), // Akcje kontekstu
  }))
);