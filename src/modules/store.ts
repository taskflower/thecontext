/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { TYPES, SelectionState } from "./common/types";
import { Workspace, WorkspaceActions } from "./workspaces/types";
import { ScenarioActions } from "./scenarios/types";
import { NodeActions, EdgeActions, FlowActions } from "./graph/types";
import { ContextItem } from "./context/types"; // Add this import
import { createContextActions } from "./context/contextActions"; // Add this import

import { createWorkspaceSlice } from "./workspaces/workspaceActions";
import { createScenarioSlice } from "./scenarios/scenarioActions";
import { createNodeSlice } from "./graph/nodeActions";
import { createEdgeSlice } from "./graph/edgeActions";
import { createFlowSlice } from "./flow/flowActions";

// Add this interface
export interface ContextActions {
  addContextItem: (workspaceId: string, item: ContextItem) => void;
  updateContextItem: (workspaceId: string, key: string, value: string, valueType: 'text' | 'json') => void;
  deleteContextItem: (workspaceId: string, key: string) => void;
  getContextValue: (workspaceId: string, key: string) => (state: any) => string | null;
  getContextItems: (workspaceId: string) => (state: any) => ContextItem[];
}

export interface AppState
  extends WorkspaceActions,
    ScenarioActions,
    NodeActions,
    EdgeActions,
    FlowActions,
    ContextActions { // Add ContextActions
  items: Workspace[];
  selected: SelectionState;
  stateVersion: number;
}

// Initial state
const initialState = {
  items: [
    {
      id: "workspace1",
      type: TYPES.WORKSPACE,
      title: "Chatbot Project",
      contextItems: [], // Add contextItems to initial state
      children: [
        {
          id: "scenario1",
          type: TYPES.SCENARIO,
          name: "Welcome Flow",
          description: "Initial user greeting and introduction",
          children: [
            {
              id: "node1",
              type: TYPES.NODE,
              label: "Welcome",
              assistantMessage: "Hello! I'm your virtual assistant. How can I help you today?",
              userPrompt: "",
              position: { x: 100, y: 100 },
            },
            {
              id: "node2",
              type: TYPES.NODE,
              label: "Services",
              assistantMessage: "I can help you with product information, scheduling appointments, or technical support. What would you like to know?",
              userPrompt: "I need some help",
              position: { x: 300, y: 200 },
            },
          ],
          edges: [
            {
              id: "edge1",
              type: TYPES.EDGE,
              source: "node1",
              target: "node2",
              label: "Need help",
            },
          ],
        },
      ],
    },
  ],
  selected: { workspace: "workspace1", scenario: "scenario1", node: "" },
  stateVersion: 0,
};

// Create the store with all slices and persist middleware
export const useAppStore = create<AppState>()(
  persist(
    immer((...a) => ({
      ...initialState,
      ...createWorkspaceSlice(...a),
      ...createScenarioSlice(...a),
      ...createNodeSlice(...a),
      ...createEdgeSlice(...a),
      ...createFlowSlice(...a),
      ...createContextActions(...a), // Add createContextActions
    })),
    {
      name: "context-app-storage", // Unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      // Optional: specify which parts of the state to persist
      partialize: (state) => ({
        items: state.items,
        selected: state.selected,
        // We don't need to persist stateVersion
      }),
      // Optional: custom merge function to handle merging persisted state with initial state
      merge: (persistedState, currentState) => {
        // Type assertion to handle the fact that persisted state might be partial
        const typedPersistedState = persistedState as Partial<AppState>;
        
        return {
          ...currentState,
          ...(typedPersistedState as object),
          // Make sure stateVersion is incremented to trigger re-renders
          stateVersion: currentState.stateVersion + 1,
        };
      },
      // Version handling for migrations
      version: 1,
      // Optional: migration function if state structure changes
      migrate: (persistedState, version) => {
        // This is where you would handle migration if you change state structure
        // For now, just return the state as is
        return persistedState as AppState;
      },
    }
  )
);

// Optional: Add a way to clear persisted state for debugging/testing
export const clearPersistedState = () => {
  localStorage.removeItem("context-app-storage");
  window.location.reload();
};