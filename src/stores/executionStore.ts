/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  recordResult: (
    executionId: string,
    nodeId: string,
    input: string,
    output: string,
    pluginId?: string,
    pluginResult?: any,
    duration?: number
  ) => string;
  executeNode: (
    executionId: string,
    nodeId: string,
    input?: string
  ) => Promise<string>;
  executeScenario: (scenarioId: string) => Promise<string>;
  processVariables: (text: string, executionId: string) => string;
  calculateExecutionOrder: (scenarioId: string) => string[];
  getNodeInput: (nodeId: string, executionId: string) => string;
  getExecution: (id: string) => Execution | null;
  getExecutionsByScenario: (scenarioId: string) => Execution[];
  getLatestExecution: (scenarioId: string) => Execution | null;
  getResults: (executionId: string) => Record<string, ExecutionResult> | null;
  deleteExecution: (id: string) => void;
  clearHistory: (scenarioId?: string) => void;
  setCurrentNodeInExecution: (executionId: string, nodeId: string) => void;
  getCurrentNodeInExecution: (executionId: string) => string | undefined;
}

export const useExecutionStore = create<ExecutionState & ExecutionActions>()(
  persist(
    (set, get) => ({
      executions: {},
      currentExecutionId: null,
      executionHistory: [],

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

      recordResult: (
        executionId,
        nodeId,
        input,
        output,
        pluginId,
        pluginResult,
        duration = 0
      ) => {
        set((state) => {
          if (!state.executions[executionId]) return state;

          const result: ExecutionResult = {
            nodeId,
            input,
            output,
            pluginId,
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

        // Aktualizacja odpowiedzi węzła w NodeStore
        const nodeStore = useNodeStore.getState();
        nodeStore.setNodeResponse(nodeId, output);

        return output;
      },

      executeNode: async (executionId, nodeId, input = "") => {
        const startTime = Date.now();

        try {
          const nodeStore = useNodeStore.getState();
          const node = nodeStore.getNode(nodeId);

          if (!node) {
            throw new Error(`Node ${nodeId} not found`);
          }

          // Pobierz własny content węzła
          const nodeContent = node.data.content || node.data.prompt || "";
          
          // Użyj podanego input jeśli istnieje, w przeciwnym razie użyj treści węzła
          const contentToProcess = input || nodeContent;
          
          // Przetwórz zmienne w treści
          const processedContent = get().processVariables(contentToProcess, executionId);
          
          // Wykonaj plugin, jeśli przypisany
          let output = processedContent;
          let pluginResult = null;

          if (node.data.pluginId) {
            const pluginStore = usePluginStore.getState();
            const result = await pluginStore.processNodeWithPlugin(
              nodeId,
              processedContent
            );
            output = result.output;
            pluginResult = result.result;
          }

          // Zapisz wynik
          const duration = Date.now() - startTime;
          return get().recordResult(
            executionId,
            nodeId,
            processedContent,
            output,
            node.data.pluginId ?? undefined,
            pluginResult,
            duration
          );
        } catch (error) {
          console.error(`Error executing node ${nodeId}:`, error);
          get().completeExecution(
            executionId,
            "error",
            error instanceof Error ? error.message : String(error)
          );
          return input;
        }
      },

      executeScenario: async (scenarioId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();
        
        // Rozpocznij wykonanie
        const executionId = get().startExecution(scenarioId);

        try {
          // Oblicz kolejność wykonania
          const executionOrder = get().calculateExecutionOrder(scenarioId);
          
          if (executionOrder.length === 0) {
            throw new Error("No nodes to execute");
          }

          // Wykonaj węzły w kolejności
          for (const nodeId of executionOrder) {
            const node = nodeStore.getNode(nodeId);
            if (!node) continue;

            // Wykonaj węzeł, używając jego własnej treści jako wejścia
            await get().executeNode(executionId, nodeId);
          }

          get().completeExecution(executionId, "completed");
        } catch (error) {
          console.error(`Error executing scenario ${scenarioId}:`, error);
          get().completeExecution(
            executionId,
            "error",
            error instanceof Error ? error.message : String(error)
          );
        }

        return executionId;
      },

      // Uproszczona funkcja przetwarzania zmiennych
      processVariables: (text, executionId) => {
        if (!text) return "";
        
        const execution = get().executions[executionId];
        if (!execution) return text;

        // Przetwarzaj zmienne w formacie {{nodeId.response}}
        let processedText = text;
        
        // Dopasuj wszystkie zmienne
        const variableRegex = /\{\{([^}]+)\.response\}\}/g;
        let match;
        
        while ((match = variableRegex.exec(text)) !== null) {
          const fullMatch = match[0];  // {{nodeId.response}}
          const nodeId = match[1];     // nodeId
          
          // Sprawdź czy jest wynik dla tego węzła
          if (execution.results[nodeId]) {
            const output = execution.results[nodeId].output;
            processedText = processedText.replace(fullMatch, output || "");
          }
        }
        
        return processedText;
      },

      // Obliczanie kolejności wykonania na podstawie węzła startowego i/lub krawędzi
      calculateExecutionOrder: (scenarioId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();
      
        // Pobierz wszystkie węzły dla tego scenariusza
        const nodes = nodeStore.getNodesByScenario(scenarioId);
        const edges = scenarioStore.getValidEdges(scenarioId);
        
        // Jeśli nie ma węzłów, zwróć pustą tablicę
        if (nodes.length === 0) return [];
        
        // Jeśli jest tylko jeden węzeł, zwróć go
        if (nodes.length === 1) return [nodes[0].id];
      
        // 1. Najpierw sprawdź, czy jest węzeł startowy
        const startNode = nodes.find(node => node.data.isStartNode === true);
      
        // 2. Jeśli nie ma krawędzi, ale jest węzeł startowy - ZWRÓĆ TYLKO WĘZEŁ STARTOWY
        if (edges.length === 0 && startNode) {
          return [startNode.id];
        }
      
        // 3. Jeśli są krawędzie, użyj ich do obliczenia porządku topologicznego
        if (edges.length > 0) {
          // Budowanie grafu
          const graph = {};
          const inDegree = {};
          
          // Inicjalizacja
          nodes.forEach(node => {
            graph[node.id] = [];
            inDegree[node.id] = 0;
          });
          
          // Dodawanie krawędzi do grafu
          edges.forEach(edge => {
            if (graph[edge.source]) {
              graph[edge.source].push(edge.target);
              inDegree[edge.target]++;
            }
          });
          
          // Zbiór węzłów, które są częścią połączonego grafu
          const connectedNodes = new Set();
          
          // Dodaj wszystkie węzły, które są częścią krawędzi
          edges.forEach(edge => {
            connectedNodes.add(edge.source);
            connectedNodes.add(edge.target);
          });
          
          // Algorytm sortowania topologicznego Kahna
          const queue = [];
          const result = [];
          
          // Najpierw dodaj węzeł startowy, jeśli istnieje, jest połączony i nie ma zależności
          if (startNode && connectedNodes.has(startNode.id) && inDegree[startNode.id] === 0) {
            queue.push(startNode.id);
          } else {
            // Dodaj wszystkie węzły bez zależności, które są częścią połączonego grafu
            Object.keys(inDegree).forEach(id => {
              if (inDegree[id] === 0 && connectedNodes.has(id) && (!startNode || id !== startNode.id)) {
                queue.push(id);
              }
            });
          }
          
          // Wykonaj sortowanie topologiczne
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
          
          return result;
        } 
        
        // 4. Jeśli brak krawędzi i brak węzła startowego, zwróć węzły w kolejności utworzenia
        return nodes
          .sort((a, b) => a.createdAt - b.createdAt)
          .map(node => node.id);
      },
      getNodeInput: (nodeId, executionId) => {
        const nodeStore = useNodeStore.getState();
        const node = nodeStore.getNode(nodeId);
        
        if (!node) return "";
        
        return node.data.content || node.data.prompt || "";
      },

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

      getResults: (executionId) => {
        const execution = get().executions[executionId];
        return execution ? execution.results : null;
      },

      deleteExecution: (id) => {
        set((state) => {
          const newExecutions = { ...state.executions };
          delete newExecutions[id];

          return {
            executions: newExecutions,
            executionHistory: state.executionHistory.filter(
              (execId) => execId !== id
            ),
            currentExecutionId:
              state.currentExecutionId === id ? null : state.currentExecutionId,
          };
        });
      },

      clearHistory: (scenarioId) => {
        set((state) => {
          if (scenarioId) {
            // Wyczyść tylko dla określonego scenariusza
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
            // Wyczyść całą historię
            return {
              executions: {},
              executionHistory: [],
              currentExecutionId: null,
            };
          }
        });
      },

      setCurrentNodeInExecution: (executionId, nodeId) => {
        set((state) => {
          if (!state.executions[executionId]) return state;

          return {
            executions: {
              ...state.executions,
              [executionId]: {
                ...state.executions[executionId],
                currentNodeId: nodeId,
              },
            },
          };
        });
      },

      getCurrentNodeInExecution: (executionId) => {
        const execution = get().executions[executionId];
        return execution ? execution.currentNodeId : undefined;
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