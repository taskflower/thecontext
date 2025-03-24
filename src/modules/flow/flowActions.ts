/* eslint-disable @typescript-eslint/no-explicit-any */
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

  // Nowe metody do zarządzania sesją flow
  startFlowSession: () => 
    set((state: Draft<AppState>) => {
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
        // Zapisz zmiany wprowadzone w tymczasowych krokach
        const workspace = state.items.find(w => w.id === state.selected.workspace);
        const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
        
        if (scenario) {
          // Aktualizacja oryginalnych węzłów
          state.flowSession.temporarySteps.forEach(tempNode => {
            const originalNode = scenario.children.find(n => n.id === tempNode.id);
            if (originalNode) {
              originalNode.userPrompt = tempNode.userPrompt;
              originalNode.assistantMessage = tempNode.assistantMessage;
            }
          });
          
          // Zapis do historii
          const { saveConversation } = useHistoryStore.getState();
          saveConversation(
            scenario.id,
            scenario.label || scenario.name,
            state.flowSession.temporarySteps
          );
        }
      }
      
      // Reset stanu sesji
      state.flowSession.isPlaying = false;
      state.flowSession.temporarySteps = [];
      state.flowSession.currentStepIndex = 0;
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
  
  // Modyfikacja tymczasowych węzłów
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession?.isPlaying) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].userPrompt = prompt;
      }
    }),
  
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession?.isPlaying) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].assistantMessage = message;
      }
    }),
  
  // Stare metody - tylko dla zachowania zgodności
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => {
    console.log(`Updating node ${nodeId} with assistantMessage:`, assistantMessage);
    
    set((state: any) => {
      const workspace = state.items.find(
        (w: any) => w.id === state.selected.workspace
      );
      if (!workspace) return state;
      
      const scenario = workspace.children.find(
        (s: any) => s.id === state.selected.scenario
      );
      if (!scenario) return state;
      
      const nodeIndex = scenario.children.findIndex((n: any) => n.id === nodeId);
      if (nodeIndex === -1) return state;
      
      scenario.children[nodeIndex].assistantMessage = assistantMessage;
      state.stateVersion++;
      return state;
    });
  },
  
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => {
    console.log(`Updating node ${nodeId} with userPrompt:`, userPrompt);
    
    set((state: any) => {
      const workspace = state.items.find(
        (w: any) => w.id === state.selected.workspace
      );
      if (!workspace) return state;
      
      const scenario = workspace.children.find(
        (s: any) => s.id === state.selected.scenario
      );
      if (!scenario) return state;
      
      const nodeIndex = scenario.children.findIndex((n: any) => n.id === nodeId);
      if (nodeIndex === -1) return state;
      
      scenario.children[nodeIndex].userPrompt = userPrompt;
      state.stateVersion++;
      return state;
    });
  }
});