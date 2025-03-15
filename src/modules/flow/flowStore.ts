import { create } from 'zustand';
import { FlowData, ReactFlowEdge } from '../types';
import { useScenarioStore } from '../scenarios';



export interface FlowState {
  getActiveScenarioData: () => FlowData;
}

export const useFlowStore = create<FlowState>()(() => ({
  getActiveScenarioData: () => {
    const scenario = useScenarioStore.getState().getCurrentScenario();
    
    if (!scenario) return { nodes: [], edges: [] };
    
    const nodes = scenario.children?.map(node => ({
      id: node.id,
      data: { label: `${node.label} (${node.value})` },
      position: node.position
    })) || [];
    
    const edges = scenario.edges?.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      label: edge.label
    })) as ReactFlowEdge[] || [];
    
    return { nodes, edges };
  },
}));