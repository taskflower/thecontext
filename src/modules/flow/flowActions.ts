/* eslint-disable @typescript-eslint/no-explicit-any */
import { StateCreator } from "zustand";
import { FlowActions } from "../graph/types";
import { AppState } from "../store";

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

    const nodes = scenario.children.map((node) => ({
      id: node.id,
      data: {
        label: node.label,
        nodeId: node.id,
        prompt: node.userPrompt,
        message: node.assistantMessage,
        pluginKey: node.pluginKey
      },
      position: node.position,
      selected: node.id === state.selected.node,
    }));

    const edges =
      scenario.edges?.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      })) || [];

    return { nodes, edges };
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
        // Create a deep copy to avoid reference issues
        const nodeCopy = JSON.parse(JSON.stringify(nodeData));
        path.push(nodeCopy);
        visited.add(nodeId);
  
        const nextNodes = edgesMap.get(nodeId) || [];
        for (const next of nextNodes) dfs(next);
      }
    };
  
    dfs(startNodeId);
    
    // Log the calculated path for debugging purposes
    console.log("Calculated flow path:", path.map(node => ({
      id: node.id,
      label: node.label,
      userPrompt: node.userPrompt
    })));
    
    return path;
  },
  
  // This is a helper function to manually update a node's userPrompt
  // It doesn't have to match the original interface since it's just for our use
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => {
    console.log(`Attempting to update node ${nodeId} with userPrompt:`, userPrompt);
    
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
      
      // Update the userPrompt on the node
      scenario.children[nodeIndex].userPrompt = userPrompt;
      
      // Increment state version to trigger updates
      state.stateVersion++;
      
      console.log(`Updated node ${nodeId} with userPrompt:`, userPrompt);
      return state;
    });
  }
});