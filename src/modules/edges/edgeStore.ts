import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GraphEdge, Scenario, Workspace } from '../types';
import { useWorkspaceStore } from '../workspaces';


export interface EdgeState {
  currentEdges: GraphEdge[];
  
  getCurrentEdges: () => GraphEdge[];
  addEdge: (payload: { source: string; target: string; label?: string }) => void;
  deleteEdge: (edgeId: string) => void;
}

export const useEdgeStore = create<EdgeState>()(
  immer((set) => ({
    currentEdges: [] as GraphEdge[],
    
    getCurrentEdges: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      return scenario?.edges || [];
    },
    
    addEdge: (payload) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newEdge: GraphEdge = {
        id: `edge-${Date.now()}`,
        source: payload.source,
        target: payload.target,
        label: payload.label
      };
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      
      if (scenario) {
        if (!scenario.edges) {
          scenario.edges = [];
        }
        scenario.edges.push(newEdge);
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
        
        set(state => {
          state.currentEdges = [...scenario.edges];
        });
      }
    },
    
    deleteEdge: (edgeId) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      
      if (scenario?.edges) {
        const index = scenario.edges.findIndex((e: GraphEdge) => e.id === edgeId);
        if (index !== -1) {
          scenario.edges.splice(index, 1);
          
          useWorkspaceStore.setState({
            items: newItems,
            stateVersion: stateVersion + 1
          });
          
          set(state => {
            state.currentEdges = [...scenario.edges];
          });
        }
      }
    },
  }))
);