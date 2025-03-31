/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/flow/flowActions.ts
import { StateCreator } from "zustand";
import { Draft } from "immer";
import { AppState } from "../store";
import { FlowActions } from "./types";
import useHistoryStore from "../history/historyStore";

/**
 * Creates the flow management slice for the application state
 * Handles flow session operations, path calculation, and node updates
 */
export const createFlowSlice: StateCreator<
  AppState,
  [["zustand/immer", never]],
  [],
  FlowActions
> = (set, get) => ({
  /**
   * Gets current scenario data including all nodes and edges
   */
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

    // Return original data without conversion
    return {
      nodes: scenario.children,
      edges: scenario.edges || []
    };
  },
  
  /**
   * Calculates optimal flow path through the graph using DFS algorithm
   * Finds start node by identifying node with outgoing edges but no incoming edges
   */
  calculateFlowPath: () => {
    const state = get() as AppState;
    const scenario = state.getCurrentScenario();
    if (!scenario) return [];
  
    const { children: scenarioNodes = [], edges: scenarioEdges = [] } = scenario;
  
    // Map counting incoming edges for each node
    const incomingMap = new Map<string, number>();
    scenarioEdges.forEach((edge) => {
      incomingMap.set(edge.target, (incomingMap.get(edge.target) || 0) + 1);
    });
  
    // Find start node (has outgoing edges but no incoming)
    let startNodeId: string | null = null;
    for (const node of scenarioNodes) {
      const hasOutgoing = scenarioEdges.some((edge) => edge.source === node.id);
      const incomingCount = incomingMap.get(node.id) || 0;
  
      if (hasOutgoing && incomingCount === 0) {
        startNodeId = node.id;
        break;
      }
    }
  
    // Fallback to first node if no clear start node
    if (!startNodeId && scenarioNodes.length > 0) {
      startNodeId = scenarioNodes[0].id;
    }
  
    if (!startNodeId) return [];
  
    // Create graph adjacency map
    const edgesMap = new Map<string, string[]>();
    scenarioEdges.forEach((edge) => {
      if (!edgesMap.has(edge.source)) edgesMap.set(edge.source, []);
      edgesMap.get(edge.source)?.push(edge.target);
    });
  
    // Traverse path using DFS
    const path: any[] = [];
    const visited = new Set<string>();
  
    const dfs = (nodeId: string) => {
      if (visited.has(nodeId)) return;
  
      const nodeData = scenarioNodes.find((n) => n.id === nodeId);
      if (nodeData) {
        // Create deep copy to avoid modifying original
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

  /**
   * Starts or resumes a flow session
   * If a suspended session exists, it will be resumed
   * Otherwise, a new session is created with nodes from calculateFlowPath
   */
  startFlowSession: () => 
    set((state: Draft<AppState>) => {
      // If we have existing session with steps but not playing (was paused)
      if (!state.flowSession?.isPlaying && state.flowSession?.temporarySteps && state.flowSession.temporarySteps.length > 0) {
        // Just resume session
        state.flowSession.isPlaying = true;
        return;
      }
      
      // Otherwise create new session
      const path = state.calculateFlowPath();
      if (path.length > 0) {
        // Initialize flow session if doesn't exist
        if (!state.flowSession) {
          state.flowSession = {
            isPlaying: false,
            currentStepIndex: 0,
            temporarySteps: []
          };
        }
        
        // Deep copy steps to temporary state
        state.flowSession.temporarySteps = JSON.parse(JSON.stringify(path));
        state.flowSession.currentStepIndex = 0;
        state.flowSession.isPlaying = true;
      }
    }),
  
  /**
   * Stops the current flow session
   * When saveChanges is true, the session is saved to history
   * Always resets session state when stopped
   * 
   * @param saveChanges Whether to save the session to history
   */
  stopFlowSession: (saveChanges = true) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession?.isPlaying) return;
      
      if (saveChanges) {
        // Save to history
        const workspace = state.items.find(w => w.id === state.selected.workspace);
        const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
        
        if (scenario && state.flowSession.temporarySteps && state.flowSession.temporarySteps.length > 0) {
          // Save to history
          const { saveConversation } = useHistoryStore.getState();
          saveConversation(
            scenario.id,
            scenario.label || scenario.name,
            state.flowSession.temporarySteps
          );
          
          console.log("Session successfully saved to history");
        }
      }
      
      // Always reset session state when stopped
      state.flowSession.isPlaying = false;
      state.flowSession.temporarySteps = [];
      state.flowSession.currentStepIndex = 0;
      state.stateVersion++;
    }),
  
  /**
   * Navigate to next step in flow 
   */
  nextStep: () => 
    set((state: Draft<AppState>) => {
      if (state.flowSession?.isPlaying && 
          state.flowSession.currentStepIndex < state.flowSession.temporarySteps.length - 1) {
        state.flowSession.currentStepIndex++;
      }
    }),
  
  /**
   * Navigate to previous step in flow
   */
  prevStep: () => 
    set((state: Draft<AppState>) => {
      if (state.flowSession?.isPlaying && state.flowSession.currentStepIndex > 0) {
        state.flowSession.currentStepIndex--;
      }
    }),
    
  /**
   * Reset flow session to initial state
   * Clears all temporary data and steps
   */
  resetFlowSession: () => 
    set((state: Draft<AppState>) => {
      if (state.flowSession) {
        state.flowSession.temporarySteps = [];
        state.flowSession.currentStepIndex = 0;
        state.flowSession.isPlaying = false;
      }
    }),
  
  /**
   * Update user prompt in temporary node during session
   */
  updateTempNodeUserPrompt: (nodeId: string, prompt: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].userPrompt = prompt;
      }
    }),
  
  /**
   * Update assistant message in temporary node during session
   */
  updateTempNodeAssistantMessage: (nodeId: string, message: string) => 
    set((state: Draft<AppState>) => {
      if (!state.flowSession) return;
      
      const nodeIndex = state.flowSession.temporarySteps.findIndex(node => node.id === nodeId);
      if (nodeIndex !== -1) {
        state.flowSession.temporarySteps[nodeIndex].assistantMessage = message;
      }
    }),
  
  /**
   * Smart update for assistant message - targets temporary or permanent nodes 
   * based on session state
   */
  updateNodeAssistantMessage: (nodeId: string, assistantMessage: string) => {
    const state = get();
    
    // If session is active, update temporary data
    if (state.flowSession?.isPlaying) {
      get().updateTempNodeAssistantMessage(nodeId, assistantMessage);
    } else {
      // Otherwise update original data
      set((state: Draft<AppState>) => {
        const workspace = state.items.find(w => w.id === state.selected.workspace);
        const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
        const node = scenario?.children.find(n => n.id === nodeId);
        if (node) {
          node.assistantMessage = assistantMessage;
          state.stateVersion++;
        }
      });
    }
  },
  
  /**
   * Smart update for user prompt - targets temporary or permanent nodes 
   * based on session state
   */
  updateNodeUserPrompt: (nodeId: string, userPrompt: string) => {
    const state = get();
    
    // If session is active, update temporary data
    if (state.flowSession?.isPlaying) {
      get().updateTempNodeUserPrompt(nodeId, userPrompt);
    } else {
      // Otherwise update original data
      set((state: Draft<AppState>) => {
        const workspace = state.items.find(w => w.id === state.selected.workspace);
        const scenario = workspace?.children.find(s => s.id === state.selected.scenario);
        const node = scenario?.children.find(n => n.id === nodeId);
        if (node) {
          node.userPrompt = userPrompt;
          state.stateVersion++;
        }
      });
    }
  }
});