  import { create } from "zustand";
  import { immer } from "zustand/middleware/immer";
  import { persist } from "zustand/middleware";

  // Import action slices
  import { createNodeSlice } from "./graph/nodeActions";
  import { createEdgeSlice } from "./graph/edgeActions";
  import { createScenarioSlice } from "./scenarios/scenarioActions";
  import { createWorkspaceSlice } from "./workspaces/workspaceActions";
  import { createFlowSlice } from "./flow/flowActions";
  import { createFilterSlice } from "./filters/filterActions";
  import { createContextSlice } from "./context/contextActions";

  // Import types
  import { NodeActions } from "./graph/types";
  import { EdgeActions } from "./graph/types";
  import { ScenarioActions } from "./scenarios/types";
  import { WorkspaceActions } from "./workspaces/types";
  import { FlowActions } from "./flow/types";
  import { FilterActions } from "./filters/types";
  import { ContextActions } from "./context/types";

  // Import workspace type
  import { Workspace } from "./workspaces/types";
  import { FlowSession } from "./flow/types";

  // Import initial data
  import { getInitialData } from "./initialData";

  // Type constants
  export const TYPES = {
    WORKSPACE: "workspace",
    SCENARIO: "scenario",
    NODE: "node",
    EDGE: "edge",
  };

  // Base item interface
  export interface BaseItem {
    id: string;
    type: string;
    label?: string;
    updatedAt?: number;
    createdAt?: number;
  }

  // Selected elements structure
  export interface Selected {
    workspace: string;
    scenario: string;
    node: string;
  }

  // Main app state interface
  export interface AppState extends 
    NodeActions, 
    EdgeActions, 
    ScenarioActions, 
    WorkspaceActions,
    FlowActions,
    FilterActions,
    ContextActions {
    
    // State properties
    items: Workspace[];
    selected: Selected;
    stateVersion: number;
    flowSession?: FlowSession;
  }

  // Get initial data
  const initialData = getInitialData();

  // Create the store with all slices and persist middleware
  export const useAppStore = create<AppState>()(
    persist(
      immer((...args) => ({
        // Initial state from demo or saved
        items: initialData.items || [],
        selected: initialData.selected || {
          workspace: "",
          scenario: "",
          node: "",
        },
        stateVersion: initialData.stateVersion || 0,
        flowSession: undefined,
        
        // Attach all slices
        ...createNodeSlice(...args),
        ...createEdgeSlice(...args),
        ...createScenarioSlice(...args),
        ...createWorkspaceSlice(...args),
        ...createFlowSlice(...args),
        ...createFilterSlice(...args),
        ...createContextSlice(...args),
      })),
      {
        name: 'flowchart-app-state',
        // Don't persist temporary flow session
        partialize: (state: AppState) => ({
          ...state,
          flowSession: undefined
        })
      }
    )
  );