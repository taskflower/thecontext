/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/index.ts
// Central export file for all stores

import { useExecutionStore } from "./executionStore";
import { useNodeStore } from "./nodeStore";
import { useScenarioStore } from "./scenarioStore";
import { useWorkspaceStore } from "./workspaceStore";




// Registers all stores on the window for plugin access
export const registerStoresForPlugins = () => {
  if (typeof window !== 'undefined') {
    // Only expose specific API methods, not the entire store
    (window as any).storeAPI = {
      workspace: {
        getContext: (workspaceId: string) => useWorkspaceStore.getState().getWorkspaceContext(workspaceId),
        updateContext: (workspaceId: string, updates: Record<string, any>) => 
          useWorkspaceStore.getState().updateWorkspaceContext(workspaceId, updates)
      },
      scenario: {
        getScenario: (scenarioId: string) => useScenarioStore.getState().getScenario(scenarioId)
      },
      node: {
        getNode: (nodeId: string) => useNodeStore.getState().getNode(nodeId),
        updateNodeData: (nodeId: string, data: any) => useNodeStore.getState().updateNodeData(nodeId, data)
      },
      execution: {
        getResults: (executionId: string) => useExecutionStore.getState().getResults(executionId)
      }
    };
  }
};