// src/modules/store.ts
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
import type { NodeActions } from "./graph/types";
import type { EdgeActions } from "./graph/types";
import type { ScenarioActions } from "./scenarios/types";
import type { WorkspaceActions } from "./workspaces/types";
import type { FlowActions, FlowSession } from "./flow/types";
import type { FilterActions } from "./filters/types";
import type { ContextActions } from "./context/types";
import type { Workspace } from "./workspaces/types";

// Import initial data
import { getInitialData } from "./initialData";

/**
 * Type constants for different node types in the application
 */
export const TYPES = {
  WORKSPACE: "workspace",
  SCENARIO: "scenario",
  NODE: "node",
  EDGE: "edge",
} as const;

export type ItemType = typeof TYPES[keyof typeof TYPES];

/**
 * Base interface for all items in the application
 */
export interface BaseItem {
  id: string;
  type: ItemType;
  label?: string;
  name?: string;
  updatedAt?: number;
  createdAt?: number;
}

/**
 * Interface for tracking selected elements
 */
export interface Selected {
  workspace: string;
  scenario: string;
  node: string;
}

/**
 * Main application state interface
 * Combines all action types and state properties
 */
export interface AppState extends 
  NodeActions, 
  EdgeActions, 
  ScenarioActions, 
  WorkspaceActions,
  FlowActions,
  FilterActions,
  ContextActions {
  
  // Core state properties
  items: Workspace[];
  selected: Selected;
  stateVersion: number;
  flowSession?: FlowSession;
}

// Get initial app data
const initialData = getInitialData();

/**
 * Main application store that combines all feature slices
 * Uses immer for immutable updates and persist for local storage persistence
 */
export const useAppStore = create<AppState>()(
  persist(
    immer((...args) => ({
      // Initial state
      items: initialData.items || [],
      selected: initialData.selected || {
        workspace: "",
        scenario: "",
        node: "",
      },
      stateVersion: initialData.stateVersion || 0,
      flowSession: undefined,
      
      // Attach all feature slices
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
      version: 1,
    }
  )
);