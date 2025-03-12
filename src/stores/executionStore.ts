/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/executionStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { useScenarioStore } from './scenarioStore';
import { useNodeStore, Node } from './nodeStore';
import { usePluginStore } from './pluginStore';

export interface ExecutionResult {
  nodeId: string;
  input: string;
  output: string;
  pluginId?: string;
  pluginResult?: any;
  timestamp: number;
  duration: number;
}

export interface Execution {
  id: string;
  scenarioId: string;
  startTime: number;
  endTime?: number;
  status: 'running' | 'completed' | 'error' | 'interrupted';
  results: Record<string, ExecutionResult>;
  error?: string;
}

interface ExecutionState {
  executions: Record<string, Execution>;
  currentExecutionId: string | null;
  executionHistory: string[];
}

interface ExecutionActions {
  // Execution creation
  startExecution: (scenarioId: string) => string;
  completeExecution: (id: string, status?: 'completed' | 'error' | 'interrupted', error?: string) => void;
  
  // Result recording
  recordResult: (
    executionId: string,
    nodeId: string,
    input: string,
    output: string,
    pluginId?: string,
    pluginResult?: any,
    duration?: number
  ) => string;
  
  // Node execution
  executeNode: (executionId: string, nodeId: string, input?: string) => Promise<string>;
  executeScenario: (scenarioId: string) => Promise<string>;
  
  // Helper methods
  processVariables: (text: string, executionId: string) => Promise<string>;
  calculateExecutionOrder: (scenarioId: string) => Promise<string[]>;
  getNodeInput: (nodeId: string, executionId: string) => Promise<string>;
  
  // Execution retrieval
  getExecution: (id: string) => Execution | null;
  getExecutionsByScenario: (scenarioId: string) => Execution[];
  getLatestExecution: (scenarioId: string) => Execution | null;
  getResults: (executionId: string) => Record<string, ExecutionResult> | null;
  
  // Execution management
  deleteExecution: (id: string) => void;
  clearHistory: (scenarioId?: string) => void;
}

export const useExecutionStore = create<ExecutionState & ExecutionActions>()(
  persist(
    (set, get) => ({
      executions: {},
      currentExecutionId: null,
      executionHistory: [],
      
      // Execution creation
      startExecution: (scenarioId) => {
        const id = nanoid();
        const execution: Execution = {
          id,
          scenarioId,
          startTime: Date.now(),
          status: 'running',
          results: {}
        };
        
        set((state) => ({
          executions: { ...state.executions, [id]: execution },
          currentExecutionId: id,
          executionHistory: [id, ...state.executionHistory].slice(0, 50) // Keep only the latest 50 executions
        }));
        
        return id;
      },
      
      completeExecution: (id, status = 'completed', error) => {
        set((state) => {
          if (!state.executions[id]) return state;
          
          return {
            executions: {
              ...state.executions,
              [id]: {
                ...state.executions[id],
                endTime: Date.now(),
                status,
                error
              }
            },
            currentExecutionId: status === 'completed' ? state.currentExecutionId : null
          };
        });
      },
      
      // Result recording
      recordResult: (executionId, nodeId, input, output, pluginId, pluginResult, duration = 0) => {
        set((state) => {
          if (!state.executions[executionId]) return state;
          
          const result: ExecutionResult = {
            nodeId,
            input,
            output,
            pluginId,
            pluginResult,
            timestamp: Date.now(),
            duration
          };
          
          return {
            executions: {
              ...state.executions,
              [executionId]: {
                ...state.executions[executionId],
                results: {
                  ...state.executions[executionId].results,
                  [nodeId]: result
                }
              }
            }
          };
        });
        
        // Also update node response in NodeStore
        const nodeStore = useNodeStore.getState();
        nodeStore.setNodeResponse(nodeId, output);
        
        return output;
      },
      
      // Node execution
      executeNode: async (executionId, nodeId, input = '') => {
        const startTime = Date.now();
        
        try {
          const nodeStore = useNodeStore.getState();
          const node = nodeStore.getNode(nodeId);
          
          if (!node) {
            throw new Error(`Node ${nodeId} not found`);
          }
          
          // Process input with template variables
          const processedInput = await get().processVariables(input, executionId);
          
          // Execute plugin if assigned
          let output = processedInput;
          let pluginResult = null;
          
          if (node.data.pluginId) {
            const pluginStore = usePluginStore.getState();
            const result = await pluginStore.processNodeWithPlugin(nodeId, processedInput);
            output = result.output;
            pluginResult = result.result;
          }
          
          // Record the result
          const duration = Date.now() - startTime;
          return get().recordResult(
            executionId,
            nodeId,
            processedInput,
            output,
            node.data.pluginId,
            pluginResult,
            duration
          );
        } catch (error) {
          console.error(`Error executing node ${nodeId}:`, error);
          get().completeExecution(executionId, 'error', error instanceof Error ? error.message : String(error));
          return input; // Return the original input in case of error
        }
      },
      
      executeScenario: async (scenarioId) => {
        const scenarioStore = useScenarioStore.getState();
        const scenario = scenarioStore.getScenario(scenarioId);
        
        if (!scenario) {
          throw new Error(`Scenario ${scenarioId} not found`);
        }
        
        const executionId = get().startExecution(scenarioId);
        
        try {
          // Get execution order from graph structure
          const executionOrder = await get().calculateExecutionOrder(scenarioId);
          
          // Execute nodes in order
          for (const nodeId of executionOrder) {
            const nodeStore = useNodeStore.getState();
            const node = nodeStore.getNode(nodeId);
            
            if (!node) continue;
            
            // Determine input based on node connections
            const input = await get().getNodeInput(nodeId, executionId);
            
            // Execute the node
            await get().executeNode(executionId, nodeId, input);
          }
          
          get().completeExecution(executionId, 'completed');
        } catch (error) {
          console.error(`Error executing scenario ${scenarioId}:`, error);
          get().completeExecution(executionId, 'error', error instanceof Error ? error.message : String(error));
        }
        
        return executionId;
      },
      
      // Helper method to calculate execution order
      calculateExecutionOrder: async (scenarioId) => {
        const scenarioStore = useScenarioStore.getState();
        const nodeStore = useNodeStore.getState();
        
        const scenario = scenarioStore.getScenario(scenarioId);
        if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);
        
        const nodes = scenario.nodeIds
          .map(id => nodeStore.getNode(id))
          .filter((node): node is Node => node !== null);
        
        const edges = scenario.edgeIds
          .map(id => scenarioStore.edges[id])
          .filter(edge => edge !== undefined);
        
        // Build graph
        const graph: Record<string, string[]> = {};
        const inDegree: Record<string, number> = {};
        
        // Initialize
        nodes.forEach(node => {
          graph[node.id] = [];
          inDegree[node.id] = 0;
        });
        
        // Build adjacency list
        edges.forEach(edge => {
          if (edge && graph[edge.source] && inDegree[edge.target] !== undefined) {
            graph[edge.source].push(edge.target);
            inDegree[edge.target]++;
          }
        });
        
        // Topological sort using Kahn's algorithm
        const queue: string[] = [];
        const result: string[] = [];
        
        // Add nodes with no dependencies to queue
        Object.keys(inDegree).forEach(nodeId => {
          if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
          }
        });
        
        while (queue.length > 0) {
          const nodeId = queue.shift()!;
          result.push(nodeId);
          
          graph[nodeId].forEach(neighborId => {
            inDegree[neighborId]--;
            
            if (inDegree[neighborId] === 0) {
              queue.push(neighborId);
            }
          });
        }
        
        // Check for cycles
        if (result.length !== nodes.length) {
          throw new Error('Scenario contains circular dependencies');
        }
        
        return result;
      },
      
      // Helper to get input for a node based on connections
      getNodeInput: async (nodeId, executionId) => {
        const scenarioStore = useScenarioStore.getState();
        const nodeStore = useNodeStore.getState();
        
        const node = nodeStore.getNode(nodeId);
        if (!node) return '';
        
        const scenario = scenarioStore.getScenario(node.scenarioId);
        if (!scenario) return '';
        
        // Find incoming edges
        const incomingEdges = scenario.edgeIds
          .map(id => scenarioStore.edges[id])
          .filter(edge => edge && edge.target === nodeId);
        
        if (incomingEdges.length === 0) {
          // No incoming edges, use node's own content/prompt
          return node.data.content || node.data.prompt || '';
        }
        
        // Get results from source nodes
        let input = node.data.content || node.data.prompt || '';
        
        // For each incoming edge, apply the source node's result to the input
        for (const edge of incomingEdges) {
          if (!edge) continue;
          
          const sourceNode = nodeStore.getNode(edge.source);
          if (!sourceNode) continue;
          
          // Get source node result from this execution
          const result = get().executions[executionId]?.results[edge.source];
          
          if (result) {
            // Replace variable references with the result
            const variableName = `{{${edge.source}.response}}`;
            input = input.replace(variableName, result.output);
          }
        }
        
        return input;
      },
      
      // Helper to process variables in text
      processVariables: async (text, executionId) => {
        if (!text) return '';
        
        // Match all variable references {{nodeId.response}}
        const variableRegex = /\{\{([^}]+)\.response\}\}/g;
        const matches = text.match(variableRegex);
        
        if (!matches) return text;
        
        let processedText = text;
        
        for (const match of matches) {
          const nodeId = match.slice(2, -11); // Extract nodeId from {{nodeId.response}}
          
          // Get result from execution
          const result = get().executions[executionId]?.results[nodeId];
          
          if (result) {
            processedText = processedText.replace(match, result.output);
          }
        }
        
        return processedText;
      },
      
      // Execution retrieval
      getExecution: (id) => {
        return get().executions[id] || null;
      },
      
      getExecutionsByScenario: (scenarioId) => {
        return Object.values(get().executions)
          .filter(execution => execution.scenarioId === scenarioId)
          .sort((a, b) => b.startTime - a.startTime);
      },
      
      getLatestExecution: (scenarioId) => {
        const executions = get().getExecutionsByScenario(scenarioId);
        return executions.length > 0 ? executions[0] : null;
      },
      
      getResults: (executionId) => {
        const execution = get().executions[executionId];
        return execution ? execution.results : null;
      },
      
      // Execution management
      deleteExecution: (id) => {
        set((state) => {
          const newExecutions = { ...state.executions };
          delete newExecutions[id];
          
          return {
            executions: newExecutions,
            executionHistory: state.executionHistory.filter(execId => execId !== id),
            currentExecutionId: state.currentExecutionId === id ? null : state.currentExecutionId
          };
        });
      },
      
      clearHistory: (scenarioId) => {
        set((state) => {
          if (scenarioId) {
            // Clear only for specific scenario
            const executionsToKeep = Object.entries(state.executions)
              .filter(([_, execution]) => execution.scenarioId !== scenarioId)
              .reduce((acc, [id, execution]) => ({ ...acc, [id]: execution }), {});
            
            return {
              executions: executionsToKeep,
              executionHistory: state.executionHistory.filter(
                id => state.executions[id]?.scenarioId !== scenarioId
              ),
              currentExecutionId: state.currentExecutionId && 
                state.executions[state.currentExecutionId]?.scenarioId === scenarioId
                ? null
                : state.currentExecutionId
            };
          } else {
            // Clear all history
            return {
              executions: {},
              executionHistory: [],
              currentExecutionId: null
            };
          }
        });
      }
    }),
    {
      name: 'execution-storage',
      partialize: (state) => ({
        executions: state.executions,
        executionHistory: state.executionHistory,
        currentExecutionId: state.currentExecutionId
      })
    }
  )
);