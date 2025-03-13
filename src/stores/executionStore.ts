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
    prompt: string,
    message: string,
    pluginId?: string,
    pluginResult?: any,
    duration?: number
  ) => string;
  executeNode: (
    executionId: string,
    nodeId: string,
    input?: string
  ) => Promise<string>;
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
        executionId: string,
        nodeId: string,
        prompt: string,
        message: string,
        pluginId?: string,
        pluginResult?: any,
        duration: number = 0
      ) => {
        set((state) => {
          if (!state.executions[executionId]) return state;
      
          const result: ExecutionResult = {
            nodeId,
            prompt, // zachowujemy oryginalną wartość
            message,
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
        nodeStore.setNodeResponse(nodeId, message);
      
        return message;
      },
      

      executeNode: async (executionId, nodeId, message = "") => {
        const startTime = Date.now();
      
        try {
          const nodeStore = useNodeStore.getState();
          const node = nodeStore.getNode(nodeId);
      
          if (!node) {
            throw new Error(`Node ${nodeId} not found`);
          }
      
          // Pobierz oryginalny prompt
          let prompt = node.data.prompt || "";
          
          // Przetwórz zmienne w promptcie
          prompt = get().processVariables(prompt, executionId);
          
          // Zapisz przetworzony prompt z powrotem do node.data.processedPrompt
          nodeStore.updateNodeData(nodeId, { processedPrompt: prompt });
          
          let pluginResult = null;
      
          if (node.data.pluginId) {
            const pluginStore = usePluginStore.getState();
            const result = await pluginStore.processNodeWithPlugin(
              nodeId,
              message // Używamy surowej treści
            );
            message = result.output;
            pluginResult = result.result;
          }
      
          // Zapisz wynik
          const duration = Date.now() - startTime;
          return get().recordResult(
            executionId,
            nodeId,
            prompt, // Używamy przetworzonego promptu
            message,
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
          return prompt;
        }
      },

     

      // Uproszczona funkcja przetwarzania zmiennych
      processVariables: (text, executionId) => {
        if (!text) return "";
        
        const execution = get().executions[executionId];
        if (!execution) return text;

        console.log("DEBUG processVariables:", {
          text,
          executionId,
          resultsAvailable: Object.keys(execution.results),
          variablesFound: [...text.matchAll(/\{\{([^}]+)\.response\}\}/g)].map(m => ({
            fullMatch: m[0],
            nodeId: m[1],
            hasResult: execution.results[m[1]] !== undefined,
            resultValue: execution.results[m[1]] ? execution.results[m[1]].message : "N/A"
          }))
        });
      
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
            // Zmiana z "prompt" na "message"
            const output = execution.results[nodeId].message;
            processedText = processedText.replace(fullMatch, output || "");
          }
        }
        
        return processedText;
      },

      // Obliczanie kolejności wykonania na podstawie węzła startowego i/lub krawędzi
      calculateExecutionOrder: (scenarioId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();
      
        // Pobierz węzły i krawędzie
        const nodes = nodeStore.getNodesByScenario(scenarioId);
        const edges = scenarioStore.getValidEdges(scenarioId);
        
        if (nodes.length === 0) return [];
        if (nodes.length === 1) return [nodes[0].id];
      
        // Znajdź węzeł startowy
        const startNode = nodes.find(node => node.data.isStartNode === true);
        
        // Jeśli jest węzeł startowy, wykonujemy tylko od niego w dół grafu
        if (startNode) {
          // Budujemy graf w kierunku przepływu
          const graph = {};
          
          // Inicjalizacja grafu
          nodes.forEach(node => {
            graph[node.id] = [];
          });
          
          // Dodawanie krawędzi
          edges.forEach(edge => {
            if (graph[edge.source]) {
              graph[edge.source].push(edge.target);
            }
          });
          
          // Wyszukujemy wszystkie węzły dostępne od węzła startowego używając BFS
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
          
          // Teraz wykonujemy sortowanie topologiczne tylko dla węzłów dostępnych od startowego
          const relevantNodes = nodes.filter(node => visited.has(node.id));
          const relevantEdges = edges.filter(edge => 
            visited.has(edge.source) && visited.has(edge.target)
          );
          
          // Budujemy graf potrzebny do sortowania
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
          
          // Wykonujemy algorytm Kahna, zaczynając od startowego węzła
          const result = [];
          const sortQueue = [];
          
          // Najpierw dodajemy węzeł startowy
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
          
          // Jeśli jakieś węzły z naszego zestawu nie zostały odwiedzone (cykle), dodajemy je
          const processedIds = new Set(result);
          relevantNodes.forEach(node => {
            if (!processedIds.has(node.id)) {
              result.push(node.id);
            }
          });
          
          return result;
        }
        
        // Jeśli nie ma węzła startowego, używamy standardowego sortowania topologicznego
        // Budujemy graf
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
        
        // Wykonujemy algorytm Kahna
        const result = [];
        const queue = [];
        
        // Dodajemy wszystkie węzły bez zależności
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
        
        // Jeśli jakieś węzły nie zostały odwiedzone (cykle), dodajemy je
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
      getNodeInput: (nodeId) => {
        const nodeStore = useNodeStore.getState();
        const node = nodeStore.getNode(nodeId);
        return node ? node.data.prompt : "";
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