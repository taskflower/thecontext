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
  processVariables: (text: string, executionId: string) => Promise<string>;
  calculateExecutionOrder: (scenarioId: string) => Promise<string[]>;
  getNodeInput: (nodeId: string, executionId: string) => Promise<string>;
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
        console.log(`[executeNode] Start dla węzła: ${nodeId}, input: "${input.substring(0, 100)}..."`);
        console.log(`[executeNode] executionId: ${executionId}`);
        const startTime = Date.now();

        try {
          const nodeStore = useNodeStore.getState();
          const node = nodeStore.getNode(nodeId);

          if (!node) {
            throw new Error(`Node ${nodeId} not found`);
          }

          // Ustawienie bieżącego węzła dla wykonania
          get().setCurrentNodeInExecution(executionId, nodeId);

          const currentExecution = get().executions[executionId];
    console.log(`[executeNode] Stan wykonania:`, {
      id: executionId,
      isValid: !!currentExecution,
      status: currentExecution?.status,
      resultCount: currentExecution ? Object.keys(currentExecution.results).length : 0,
      resultKeys: currentExecution ? Object.keys(currentExecution.results) : []
    });

    // Przetworzenie zmiennych w tekście
    console.log(`[executeNode] Przed processVariables input: "${input.substring(0, 100)}..."`);
    console.log(`[executeNode] Input zawiera zmienne?:`, input.includes("{{") && input.includes(".response}}"));
    

          // Przetworzenie zmiennych w tekście
          const processedInput = await get().processVariables(
            input,
            executionId
          );

          console.log(`[executeNode] Po processVariables: "${processedInput.substring(0, 100)}..."`);
    console.log(`[executeNode] Czy input został zmieniony?:`, input !== processedInput);

          // Wykonanie pluginu, jeśli przypisany
          let output = processedInput;
          let pluginResult = null;

          if (node.data.pluginId) {
            const pluginStore = usePluginStore.getState();
            const result = await pluginStore.processNodeWithPlugin(
              nodeId,
              processedInput
            );
            output = result.output;
            pluginResult = result.result;
          }

          // Zapisanie wyniku
          const duration = Date.now() - startTime;
          return get().recordResult(
            executionId,
            nodeId,
            processedInput,
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
          return input; // Zwrócenie oryginalnego wejścia w przypadku błędu
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
          // Obliczenie kolejności wykonania na podstawie struktury grafu
          const executionOrder = await get().calculateExecutionOrder(
            scenarioId
          );

          // Wykonanie węzłów w kolejności
          for (const nodeId of executionOrder) {
            const nodeStore = useNodeStore.getState();
            const node = nodeStore.getNode(nodeId);

            if (!node) continue;

            // Określenie wejścia na podstawie połączeń węzła
            const input = await get().getNodeInput(nodeId, executionId);

            // Wykonanie węzła
            await get().executeNode(executionId, nodeId, input);
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

      // Metoda pomocnicza do obliczania kolejności wykonania
      calculateExecutionOrder: async (scenarioId) => {
        const scenarioStore = useScenarioStore.getState();
        const nodeStore = useNodeStore.getState();

        const scenario = scenarioStore.getScenario(scenarioId);
        if (!scenario) throw new Error(`Scenario ${scenarioId} not found`);

        // Pobierz węzły bezpośrednio z nodeStore zamiast przez scenariusz
        const nodes = nodeStore.getNodesByScenario(scenarioId);
        // const nodeIds = nodes.map((node) => node.id);

        // Pobierz tylko te krawędzie, które łączą istniejące węzły
        const edges = scenarioStore.getValidEdges(scenarioId);

        // Buduj graf
        const graph: Record<string, string[]> = {};
        const inDegree: Record<string, number> = {};

        // Inicjalizacja
        nodes.forEach((node) => {
          graph[node.id] = [];
          inDegree[node.id] = 0;
        });

        // Buduj listę sąsiedztwa
        edges.forEach((edge) => {
          if (graph[edge.source] && inDegree[edge.target] !== undefined) {
            graph[edge.source].push(edge.target);
            inDegree[edge.target]++;
          }
        });

        // Sortowanie topologiczne algorytmem Kahna
        const queue: string[] = [];
        const result: string[] = [];

        // Węzły bez zależności trafiają do kolejki
        Object.keys(inDegree).forEach((nodeId) => {
          if (inDegree[nodeId] === 0) {
            queue.push(nodeId);
          }
        });

        while (queue.length > 0) {
          const nodeId = queue.shift()!;
          result.push(nodeId);

          graph[nodeId].forEach((neighborId) => {
            inDegree[neighborId]--;
            if (inDegree[neighborId] === 0) {
              queue.push(neighborId);
            }
          });
        }

        // Jeśli nie wszystkie węzły zostały przetworzone, zgłoś ostrzeżenie
        if (result.length !== nodes.length) {
          console.warn("Scenario may contain circular dependencies");
        }

        return result;
      },

      // Metoda pomocnicza do pobierania wejścia dla węzła na podstawie połączeń
      getNodeInput: async (nodeId, executionId) => {
        const nodeStore = useNodeStore.getState();
        const scenarioStore = useScenarioStore.getState();

        const node = nodeStore.getNode(nodeId);
        if (!node) return "";

        const scenario = scenarioStore.getScenario(node.scenarioId);
        if (!scenario) return "";

        // Znajdź krawędzie wchodzące
        const incomingEdges = scenarioStore
          .getValidEdges(scenario.id)
          .filter((edge) => edge.target === nodeId);

        if (incomingEdges.length === 0) {
          // Brak krawędzi wchodzących, użyj własnej treści/promptu węzła
          return node.data.content || node.data.prompt || "";
        }

        // Pobierz wyniki z węzłów źródłowych
        let input = node.data.content || node.data.prompt || "";

        // Dla każdej krawędzi wchodzącej, zastosuj wynik węzła źródłowego do wejścia
        for (const edge of incomingEdges) {
          const sourceNode = nodeStore.getNode(edge.source);
          if (!sourceNode) continue;

          // Pobierz wynik węzła źródłowego z tego wykonania
          const result = get().executions[executionId]?.results[edge.source];

          if (result) {
            // Zastąp odniesienia do zmiennych wynikiem
            const variableName = `{{${edge.source}.response}}`;
            input = input.replace(variableName, result.output);
          }
        }

        return input;
      },

      // Metoda pomocnicza do przetwarzania zmiennych w tekście
      processVariables: async (text, executionId) => {
        console.log("PROCESSING VARIABLES - Input:", text);
        if (!text) return "";

        // Dopasuj wszystkie odniesienia do zmiennych {{nodeId.response}}
        const variableRegex = /\{\{([^}]+)\.response\}\}/g;
        const matches = text.match(variableRegex);
        console.log("VARIABLE MATCHES:", matches);
        if (!matches) return text;

        let processedText = text;

        for (const match of matches) {
          const nodeId = match.slice(2, -11); // Wyodrębnij nodeId z {{nodeId.response}}
          console.log("PROCESSING NODE ID:", nodeId);
          // Pobierz wynik z wykonania
          const result = get().executions[executionId]?.results[nodeId];
          console.log("RESULT FOR NODE:", result);
          if (result) {
            processedText = processedText.replace(match, result.output);
            console.log("AFTER REPLACEMENT:", processedText);
          }
        }

        return processedText;
      },

      // Pobieranie wykonania
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

      // Zarządzanie wykonaniem
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

      // Metody śledzenia wykonania krok po kroku
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
