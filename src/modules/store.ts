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

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    items: initialState.items,
    selected: initialState.selected,
    stateVersion: 0,
    conversation: [],

    // Combine all actions
    ...createWorkspaceActions(set, get),
    ...createScenarioActions(set, get),
    ...createNodeActions(set, get),
    ...createEdgeActions(set, get),
    ...createConversationActions(set),
    ...createSelectionActions(set),
    ...createHelperActions(get),
  }))
);