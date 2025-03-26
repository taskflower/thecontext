/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flow/flowActions.ts
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { AppState } from "../store";
import { FlowActions } from "./types";
import useHistoryStore from "../history/historyStore";

export const createFlowSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  FlowActions
> = (set, get) => ({
  getActiveScenarioData: () => {
    const state = get() as AppState;
    const workspace = state.items.find(
      (w) => w.id === state.selected.workspace
    );
    if (!workspace) return { nodes: [], edges: [] };

    const scenario = workspace.children.find(
      (s) => s.id === state.selected.scenario
    );
    if (!scenario) return { nodes: [], edges: [] };

    // Zwracamy oryginalne dane bez konwersji
    return {
      nodes: scenario.children,
      edges: scenario.edges || []
    };
  },
  
  calculateFlowPath: () => {
    const state = get() as AppState;
    const scenario = state.getCurrentScenario();
    if (!scenario) return [];
  
    const { children: scenarioNodes = [], edges: scenarioEdges = [] } = scenario;
  
    // Mapa zliczająca przychodzące krawędzie dla każdego węzła
    const incomingMap = new Map<string, number>();
    scenarioEdges.forEach((edge) => {
      incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
    });
  
    // Znajdź węzeł startowy (ma krawędzie wychodzące, ale brak przychodzących)
    let startNodeId: string | null = null;
    for (const node of scenarioNodes) {
      const hasOutgoing = scenarioEdges.some((edge) => edge.source === node.id);
      const incomingCount = incomingMap.get(node.id) || 0;
  
      if (hasOutgoing && incomingCount === 0) {
        startNodeId = node.id;
        break;
      }
    }
  
    // Jeśli nie znaleziono, wybierz pierwszy
    if (!startNodeId && scenarioNodes.length > 0) {
      startNodeId = scenarioNodes[0].id;
    }
  
    if (!startNodeId) return [];
  
    // Utwórz mapę grafu (sąsiedztwa)
    const edgesMap = new Map<string, string[]>();
    scenarioEdges.forEach((edge) => {
      if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
      edgesMap.get(edge.source)?.push(edge.target);
    });
  
    // Prześledź ścieżkę metodą DFS
    const path: any[] = [];
    const visited = new Set<string>();
  
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
  
      const nodeData = scenarioNodes.find((n) => n.id === nodeId);
      if (nodeData) {
        // Utwórz głęboką kopię, żeby uniknąć modyfikacji oryginału
        const nodeCopy = JSON.parse(JSON.stringify(nodeData));
        path.push(nodeCopy);
        visited.add(nodeId);
  
        const nextNodes = edgesMap.get(nodeId) || [];
        for (const next of nextNodes) dfs(next);
      }
    };
  
    dfs(startNodeId);
    return path;
  },

  // Metody do zarządzania sesją flow
  startFlowSession: () => 
    set((state: Draft<AppState>) => {
      // Jeśli mamy istniejącą sesję z krokami, ale nie jest aktywna (została wstrzymana)
      if (!state.flowSession?.isPlaying && state.flowSession?.temporarySteps && state.flowSession.temporarySteps.length > 0) {
        // Tylko kontynuujemy sesję od ostatniego kroku - ustawiamy isPlaying na true
        state.flowSession.isPlaying = true;
        return;
      }
      
      // W przeciwnym razie tworzymy nową sesję
      const path = state.calculateFlowPath();
      if (path.length > 0) {
        // Inicjalizacja stanu sesji flow
        if (!state.flowSession) {
          state.flowSession = {
            isPlaying: false,
            currentStepIndex: 0,
            temporarySteps: []
          };
        }
        
        // Głęboka kopia kroków do tymczasowego stanu
        state.flowSession.temporarySteps = JSON.parse(JSON.stringify(path));
        state.flowSession.currentStepIndex = 0;
        state.flowSession.isPlaying = true;
      }
    }),
  
    stopFlowSession: (saveChanges = false) => 
      set((state: Draft<AppState>) => {
        if (!state.flowSession?.isPlaying) return;
        
        if (saveChanges) {
          // ZMIANA: Nie modyfikujemy oryginalnych węzłów, tylko zapisujemy do historii
          const workspace = state.items.find(w => w.id === state.selected.workspace);
          const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
          
          if (scenario && state.flowSession.temporarySteps && state.flowSession.temporarySteps.length > 0) {
            // Zapis do historii
            const { saveConversation } = useHistoryStore.getState();
            saveConversation(
              scenario.id,
              scenario.label || scenario.name,
              state.flowSession.temporarySteps
            );
          }
          
          // Reset stanu sesji
          state.flowSession.isPlaying = false;
          // Czyścimy tymczasowe kroki po zapisaniu
          state.flowSession.temporarySteps = [];
          state.flowSession.currentStepIndex = 0;
        } else {
          // Tylko zatrzymujemy sesję bez czyszczenia danych tymczasowych
          state.flowSession.isPlaying = false;
          // currentStepIndex pozostaje bez zmian
        }
        state.stateVersion++;
      }),
  
  nextStep: () => 
    set((state: Draft<AppState>) => {
      if (state.flowSession?.isPlaying && 
          state.flowSession.currentStepIndex < state.flowSession.temporarySteps.length - 1) {
        state.flowSession.currentStepIndex++;
      }
    }),
  
  prevStep: () => 
    set((state: Draft<AppState>) => {
      if (state.flowSession?.isPlaying && state.flowSession.currentStepIndex > 0) {
        state.flowSession.currentStepIndex--;
      }
    }),
    resetFlowSession: () => 
      set((state: Draft<AppState>) => {
        if (state.flowSession) {
          state.flowSession.temporarySteps = [];
          state.flowSession.currentStepIndex = 0;
          state.flowSession.isPlaying = false;
        }
      }),
  
  // Modyfikacja tymczasowych węzłów
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].userPrompt = prompt;
      }
    }),
  
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].assistantMessage = message;
      }
    }),
  
  // Stare metody - tylko dla zachowania zgodności, ale nie zmieniają oryginalnych danych
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => {
    console.log(`DEPRECATED: updateNodeAssistantMessage called, use updateTempNodeAssistantMessage instead`);
    
    // Zamiast aktualizować oryginalne dane, aktualizujemy tymczasowe dane w sesji flow
    const state = get();
    if (state.flowSession) {
      get().updateTempNodeAssistantMessage(nodeId, assistantMessage);
    }
  },
  
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => {
    console.log(`DEPRECATED: updateNodeUserPrompt called, use updateTempNodeUserPrompt instead`);
    
    // Zamiast aktualizować oryginalne dane, aktualizujemy tymczasowe dane w sesji flow
    const state = get();
    if (state.flowSession) {
      get().updateTempNodeUserPrompt(nodeId, userPrompt);
    }
  }
});