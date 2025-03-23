import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { TYPES, SelectionState } from "./common/types";
import { Workspace, WorkspaceActions } from "./workspaces/types";
import { ScenarioActions } from "./scenarios/types";
import { NodeActions, EdgeActions, FlowActions } from "./graph/types";

import { createWorkspaceSlice } from "./workspaces/workspaceActions";
import { createScenarioSlice } from "./scenarios/scenarioActions";
import { createNodeSlice } from "./graph/nodeActions";
import { createEdgeSlice } from "./graph/edgeActions";
import { createFlowSlice } from "./flow/flowActions";

export interface AppState
  extends WorkspaceActions,
    ScenarioActions,
    NodeActions,
    EdgeActions,
    FlowActions {
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

// Create the store with all slices
export const useAppStore = create<AppState>()(
  immer((...a) => ({
    ...initialState,
    ...createWorkspaceSlice(...a),
    ...createScenarioSlice(...a),
    ...createNodeSlice(...a),
    ...createEdgeSlice(...a),
    ...createFlowSlice(...a),
  }))
);