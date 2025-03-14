/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/executionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { useScenarioStore } from "./scenarioStore";
import { useNodeStore } from "./nodeStore";
import { usePluginStore } from "./pluginStore";
import { calculateExecutionOrder } from "./utils/graphUtils";
import { useWorkspaceStore } from "./workspaceStore";
interface Execution {
  id: string;
  scenarioId: string;
  startTime: number;
  status: string;
  results: any; // or define a specific type for results
}

interface ExecutionResult {
  nodeId: string;
  prompt: string;
  message: string;
  pluginId?: string;
  pluginResult: any;
  timestamp: number;
  duration: number;
}
interface ExecutionState {
  executions: Record<string, Execution>;
  currentExecutionId: string | null;
  executionHistory: string[];
}

interface ExecutionActions {
  startExecution: (scenarioId: string) => string;
  completeExecution: (
    id: string,
    status?: "completed" | "error" | "interrupted",
    error?: string
  ) => void;
  executeNode: (
    executionId: string,
    nodeId: string,
    input?: string
  ) => Promise<string>;
  processVariables: (text: string, executionId: string) => string;
  calculateExecutionOrder: (scenarioId: string) => string[];
  getExecution: (id: string) => Execution | null;
  getExecutionsByScenario: (scenarioId: string) => Execution[];
  getLatestExecution: (scenarioId: string) => Execution | null;
  clearHistory: (scenarioId?: string) => void;
}

export const useExecutionStore = create<ExecutionState & ExecutionActions>()(
  persist(
    (set, get) => ({
      executions: {},
      currentExecutionId: null,
      executionHistory: [],

      // Start a new execution for a scenario
      startExecution: (scenarioId) => {
        const id = nanoid();
        const execution: Execution = {
          id,
          scenarioId,
          startTime: Date.now(),
          status: "running",
          results: {},
        };

        set((state) => ({
          executions: { ...state.executions, [id]: execution },
          currentExecutionId: id,
          executionHistory: [id, ...state.executionHistory].slice(0, 50),
        }));

        return id;
      },

      // Complete an execution with a status
      completeExecution: (id, status = "completed", error) => {
        set((state) => {
          if (!state.executions[id]) return state;

          return {
            executions: {
              ...state.executions,
              [id]: {
                ...state.executions[id],
                endTime: Date.now(),
                status,
                error,
              },
            },
            currentExecutionId:
              status === "completed" ? state.currentExecutionId : null,
          };
        });
      },

      // Execute a node with optional input
     // Modify the executeNode function in src/stores/executionStore.ts

// Add this near the end of the executeNode function, just before returning the message
executeNode: async (executionId, nodeId, message = "") => {
  const startTime = Date.now();

  try {
    const nodeStore = useNodeStore.getState();
    const workspaceStore = useWorkspaceStore.getState();
    const scenarioStore = useScenarioStore.getState();
    const node = nodeStore.getNode(nodeId);

    if (!node) {
      throw new Error(`Node ${nodeId} not found`);
    }

    // Get the original prompt
    let prompt = node.data.prompt || "";
    
    // Process variables in the prompt
    prompt = get().processVariables(prompt, executionId);
    
    // Save processed prompt back to node data
    nodeStore.updateNodeData(nodeId, { processedPrompt: prompt });
    
    let pluginResult = null;

    // If node has a plugin, process with plugin
    if (node.data.pluginId) {
      const pluginStore = usePluginStore.getState();
      const result = await pluginStore.processNodeWithPlugin(
        nodeId,
        message
      );
      message = result.output;
      pluginResult = result.result;
    }

    // Record the result and duration
    const duration = Date.now() - startTime;
    
    // Save the result to the execution
    set((state) => {
      if (!state.executions[executionId]) return state;
      
      const result: ExecutionResult = {
        nodeId,
        prompt,
        message,
        pluginId: node.data.pluginId ?? undefined,
        pluginResult,
        timestamp: Date.now(),
        duration,
      };
      
      return {
        executions: {
          ...state.executions,
          [executionId]: {
            ...state.executions[executionId],
            results: {
              ...state.executions[executionId].results,
              [nodeId]: result,
            },
            currentNodeId: nodeId,
          },
        },
      };
    });
    
    // Update node response in NodeStore
    nodeStore.setNodeResponse(nodeId, message);
    
    // Add context update logic with a delay to ensure plugins complete
    if (node.data.contextKey && node.data.contextKey !== '') {
      console.log(`[CONTEXT UPDATE] Node ${nodeId} has contextKey: ${node.data.contextKey}`);
      
      // Get the scenario to find the correct workspaceId
      const scenarioStore = useScenarioStore.getState();
      const scenario = scenarioStore.getScenario(node.scenarioId);
      const workspaceId = scenario?.workspaceId || node.workspaceId || node.scenarioId.split('-')[0];
      
      console.log(`[CONTEXT UPDATE] Using workspaceId: ${workspaceId} for node ${nodeId}`);
      console.log(`[CONTEXT UPDATE] Current message before delay: "${message}"`);
      
      // Delay updating the context to ensure plugins have finished updating the message
     
        console.log(`[CONTEXT UPDATE] Timeout executing for node ${nodeId}, contextKey ${node.data.contextKey}`);
        
        // Get the current node again to ensure we have the latest message
        const updatedNode = nodeStore.getNode(nodeId);
        console.log(`[CONTEXT UPDATE] Updated node:`, updatedNode);
        
        if (updatedNode && updatedNode.data.message) {
          console.log(`[CONTEXT UPDATE] Updating workspace ${workspaceId} with key "${updatedNode.data.contextKey}" and value: "${updatedNode.data.message}"`);
          
          // Get current workspace context for logging
          const currentContext = workspaceStore.getWorkspaceContext(workspaceId);
          console.log(`[CONTEXT UPDATE] Current workspace context:`, currentContext);
          
          workspaceStore.updateWorkspaceContext(
            workspaceId, 
            { [updatedNode.data.contextKey]: updatedNode.data.message }
          );
          
          // Verify the update happened
          const updatedContext = workspaceStore.getWorkspaceContext(workspaceId);
          console.log(`[CONTEXT UPDATE] Updated workspace context:`, updatedContext);
          console.log(`[CONTEXT UPDATE] Completed for key "${updatedNode.data.contextKey}" with value "${updatedNode.data.message}"`);
        } else {
          console.error(`[CONTEXT UPDATE] Failed - updatedNode or message missing`, updatedNode);
        }
     
    } else {
      console.log(`[CONTEXT UPDATE] Node ${nodeId} has no contextKey defined, skipping context update`);
    }
    
    return message;
  } catch (error) {
    console.error(`Error executing node ${nodeId}:`, error);
    get().completeExecution(
      executionId,
      "error",
      error instanceof Error ? error.message : String(error)
    );
    return "";
  }
},
      // Process variables in text - replace {{nodeId.response}} with actual responses
      processVariables: (text, executionId) => {
        if (!text) return "";
        
        const execution = get().executions[executionId];
        if (!execution) return text;
      
        // Match all variables in format {{nodeId.response}}
        let processedText = text;
        const variableRegex = /\{\{([^}]+)\.response\}\}/g;
        let match;
        
        while ((match = variableRegex.exec(text)) !== null) {
          const fullMatch = match[0];
          const nodeId = match[1];
          
          // Check if there's a result for this node
          if (execution.results[nodeId]) {
            const output = execution.results[nodeId].message;
            processedText = processedText.replace(fullMatch, output || "");
          }
        }
        
        return processedText;
      },

      // Calculate execution order using utility function
      calculateExecutionOrder: (scenarioId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();
      
        // Get nodes and edges
        const nodes = nodeStore.getNodesByScenario(scenarioId);
        const edges = scenarioStore.getValidEdges(scenarioId);
        
        // Use the extracted utility function
        return calculateExecutionOrder(nodes, edges);
      },

      // Getters for executions
      getExecution: (id) => {
        return get().executions[id] || null;
      },

      getExecutionsByScenario: (scenarioId) => {
        return Object.values(get().executions)
          .filter((execution) => execution.scenarioId === scenarioId)
          .sort((a, b) => b.startTime - a.startTime);
      },

      getLatestExecution: (scenarioId) => {
        const executions = get().getExecutionsByScenario(scenarioId);
        return executions.length > 0 ? executions[0] : null;
      },

      // Clear execution history
      clearHistory: (scenarioId) => {
        set((state) => {
          if (scenarioId) {
            // Clear only for specific scenario
            const executionsToKeep = Object.entries(state.executions)
              .filter(([_, execution]) => execution.scenarioId !== scenarioId)
              .reduce(
                (acc, [id, execution]) => ({ ...acc, [id]: execution }),
                {}
              );

            return {
              executions: executionsToKeep,
              executionHistory: state.executionHistory.filter(
                (id) => state.executions[id]?.scenarioId !== scenarioId
              ),
              currentExecutionId:
                state.currentExecutionId &&
                state.executions[state.currentExecutionId]?.scenarioId ===
                  scenarioId
                  ? null
                  : state.currentExecutionId,
            };
          } else {
            // Clear all history
            return {
              executions: {},
              executionHistory: [],
              currentExecutionId: null,
            };
          }
        });
      },
    }),
    {
      name: "execution-storage",
      partialize: (state) => ({
        executions: state.executions,
        executionHistory: state.executionHistory,
        currentExecutionId: state.currentExecutionId,
      }),
    }
  )
);