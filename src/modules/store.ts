import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { persist } from "zustand/middleware";

// Importy modułów akcji
import { createNodeSlice } from "./graph/nodeActions";
import { createEdgeSlice } from "./graph/edgeActions";
import { createScenarioSlice } from "./scenarios/scenarioActions";
import { createWorkspaceSlice } from "./workspaces/workspaceActions";
import { createFlowSlice } from "./flow/flowActions";

// Importy typów
import { NodeActions } from "./graph/types";
import { EdgeActions } from "./graph/types";
import { ScenarioActions } from "./scenarios/types";
import { WorkspaceActions } from "./workspaces/types";
import { FlowActions } from "./flow/types";
import { Workspace } from "./workspaces/types";
import { FlowSession } from "./flow/types";

// Import początkowych danych
import { getInitialData } from "./initialData";
import { createContextSlice } from "./context";

// Stałe typów
export const TYPES = {
  WORKSPACE: "workspace",
  SCENARIO: "scenario",
  NODE: "node",
  EDGE: "edge",
};

// Bazowy interfejs dla wszystkich elementów
export interface BaseItem {
  id: string;
  type: string;
  label?: string;
}

// Struktura wybranych elementów
export interface Selected {
  workspace: string;
  scenario: string;
  node: string;
}

// Główny stan aplikacji
export interface AppState extends 
  NodeActions, 
  EdgeActions, 
  ScenarioActions, 
  WorkspaceActions,
  FlowActions {
  
  // Stan
  items: Workspace[];
  selected: Selected;
  stateVersion: number;
  flowSession?: FlowSession;
}

// Pobranie początkowych danych
const initialData = getInitialData();

// Utworzenie store'a z wszystkimi slicami i persist middleware
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
      ...createContextSlice(...args), // Add context slice
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