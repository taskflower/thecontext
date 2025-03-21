/* eslint-disable @typescript-eslint/no-explicit-any */
// Common types for the plugin system

export interface Plugin {
    key: string;
    enabled: boolean;
  }
  
  export interface AppContextData {
    currentWorkspace: any;
    currentScenario: any;
    currentNode: any;
    selection: {
      workspaceId: string;
      scenarioId: string;
      nodeId: string;
    };
    stateVersion: number;
  }