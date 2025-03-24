/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist, createJSONStorage } from "zustand/middleware";
import { Workspace, WorkspaceActions } from "./workspaces/types";
import { ScenarioActions } from "./scenarios/types";
import { NodeActions, EdgeActions } from "./graph/types";
import { createContextActions } from "./context/contextActions";

import { createWorkspaceSlice } from "./workspaces/workspaceActions";
import { createScenarioSlice } from "./scenarios/scenarioActions";
import { createNodeSlice } from "./graph/nodeActions";
import { createEdgeSlice } from "./graph/edgeActions";
import { createFlowSlice } from "./flow/flowActions";
import { ContextActions } from "./context";

export const TYPES = {
  WORKSPACE: "workspace",
  SCENARIO: "scenario",
  NODE: "node",
  EDGE: "edge",
};

export interface BaseItem {
  id: string;
  type: string;
}

export interface SelectionState {
  workspace: string;
  scenario: string;
  node: string;
}

export interface AppState extends WorkspaceActions, 
    ScenarioActions, 
    NodeActions, 
    EdgeActions, 
    ContextActions {
  items: Workspace[];
  selected: SelectionState;
  stateVersion: number;

}

const initialState = {
  items: [
    {
      id: "workspace1",
      type: TYPES.WORKSPACE,
      title: "Chatbot Project",
      contextItems: [], // Add contextItems to initial state
      createdAt: Date.now(),
      updatedAt: Date.now(),
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
const STORAGE_KEY = "context-app-storage";
export const useAppStore = create<AppState>()(
  persist(
    immer((...a) => ({
      ...initialState,
      ...createWorkspaceSlice(...a),
      ...createScenarioSlice(...a),
      ...createNodeSlice(...a),
      ...createEdgeSlice(...a),
      ...createFlowSlice(...a),
      ...createContextActions(...a),
    })),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        selected: state.selected,
      }),
      merge: (persistedState, currentState) => {
        const typedPersistedState = persistedState as Partial<AppState>;
        return {
          ...currentState,
          ...(typedPersistedState as object),
          stateVersion: currentState.stateVersion + 1,
        };
      },
    }
  )
);


