// src/stores/executionStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { nanoid } from "nanoid";
import { Execution, ExecutionResult } from "../types/common";
import { useScenarioStore } from "./scenarioStore";
import { useNodeStore } from "./nodeStore";
import { usePluginStore } from "./pluginStore";

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
      executeNode: async (executionId, nodeId, message = "") => {
        const startTime = Date.now();
      
        try {
          const nodeStore = useNodeStore.getState();
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
              pluginId: node.data.pluginId,
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

      // Calculate execution order based on graph topology
      calculateExecutionOrder: (scenarioId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();
      
        // Get nodes and edges
        const nodes = nodeStore.getNodesByScenario(scenarioId);
        const edges = scenarioStore.getValidEdges(scenarioId);
        
        if (nodes.length === 0) return [];
        if (nodes.length === 1) return [nodes[0].id];
      
        // Find start node if one is marked
        const startNode = nodes.find(node => node.data.isStartNode === true);
        
        // If there's a start node, execute only from it down the graph
        if (startNode) {
          // Build directed graph
          const graph = {};
          
          // Initialize graph
          nodes.forEach(node => {
            graph[node.id] = [];
          });
          
          // Add edges
          edges.forEach(edge => {
            if (graph[edge.source]) {
              graph[edge.source].push(edge.target);
            }
          });
          
          // Find all nodes reachable from start node using BFS
          const visited = new Set([startNode.id]);
          const queue = [startNode.id];
          
          while (queue.length > 0) {
            const currentId = queue.shift();
            
            if (graph[currentId]) {
              for (const nextId of graph[currentId]) {
                if (!visited.has(nextId)) {
                  visited.add(nextId);
                  queue.push(nextId);
                }
              }
            }
          }
          
          // Perform topological sort only on reachable nodes
          const relevantNodes = nodes.filter(node => visited.has(node.id));
          const relevantEdges = edges.filter(edge => 
            visited.has(edge.source) && visited.has(edge.target)
          );
          
          // Build graph for sorting
          const sortGraph = {};
          const inDegree = {};
          
          relevantNodes.forEach(node => {
            sortGraph[node.id] = [];
            inDegree[node.id] = 0;
          });
          
          relevantEdges.forEach(edge => {
            sortGraph[edge.source].push(edge.target);
            inDegree[edge.target]++;
          });
          
          // Execute Kahn's algorithm, starting from start node
          const result = [];
          const sortQueue = [];
          
          // First add start node
          sortQueue.push(startNode.id);
          
          while (sortQueue.length > 0) {
            const nodeId = sortQueue.shift();
            result.push(nodeId);
            
            sortGraph[nodeId].forEach(nextId => {
              inDegree[nextId]--;
              if (inDegree[nextId] === 0) {
                sortQueue.push(nextId);
              }
            });
          }
          
          // If any nodes from our set weren't visited (cycles), add them
          const processedIds = new Set(result);
          relevantNodes.forEach(node => {
            if (!processedIds.has(node.id)) {
              result.push(node.id);
            }
          });
          
          return result;
        }
        
        // If no start node, use standard topological sort
        // Build graph
        const graph = {};
        const inDegree = {};
        
        nodes.forEach(node => {
          graph[node.id] = [];
          inDegree[node.id] = 0;
        });
        
        edges.forEach(edge => {
          graph[edge.source].push(edge.target);
          inDegree[edge.target]++;
        });
        
        // Execute Kahn's algorithm
        const result = [];
        const queue = [];
        
        // Add all nodes with no dependencies
        nodes.forEach(node => {
          if (inDegree[node.id] === 0) {
            queue.push(node.id);
          }
        });
        
        while (queue.length > 0) {
          const nodeId = queue.shift();
          result.push(nodeId);
          
          graph[nodeId].forEach(nextId => {
            inDegree[nextId]--;
            if (inDegree[nextId] === 0) {
              queue.push(nextId);
            }
          });
        }
        
        // If any nodes weren't visited (cycles), add them
        if (result.length !== nodes.length) {
          const processed = new Set(result);
          nodes.forEach(node => {
            if (!processed.has(node.id)) {
              result.push(node.id);
            }
          });
        }
        
        return result;
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