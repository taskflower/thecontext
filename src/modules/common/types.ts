export const TYPES = {
    WORKSPACE: "workspace",
    SCENARIO: "scenario",
    NODE: "node",
    EDGE: "edge",
  };
  
  // Base interface for all items
  export interface BaseItem {
    id: string;
    type: string;
  }
  
  // Position interface for nodes
  export interface Position {
    x: number;
    y: number;
  }
  
  // Selection state interface
  export interface SelectionState {
    workspace: string;
    scenario: string;
    node: string;
  }