import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GraphEdge } from '../types';
import { useWorkspaceStore } from '../workspaces';

export interface EdgeState {
  edges: GraphEdge[];
  
  refreshEdges: () => void;
  addEdge: (payload: { source: string; target: string; label?: string }) => void;
  deleteEdge: (edgeId: string) => void;
}

export const useEdgeStore = create<EdgeState>()(
  immer((set) => ({
    edges: [],
    
    refreshEdges: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      set({ edges: scenario?.edges || [] });
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
      const workspace = newItems.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      
      if (scenario) {
        if (!scenario.edges) {
          scenario.edges = [];
        }
        scenario.edges.push(newEdge);
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
        
        // Update local store
        set(state => {
          state.edges = [...scenario.edges];
        });
      }
    },
    
    deleteEdge: (edgeId) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      
      if (scenario?.edges) {
        const index = scenario.edges.findIndex(e => e.id === edgeId);
        if (index !== -1) {
          scenario.edges.splice(index, 1);
          
          useWorkspaceStore.setState({
            items: newItems,
            stateVersion: stateVersion + 1
          });
          
          // Update local store
          set(state => {
            state.edges = [...scenario.edges];
          });
        }
      }
    },
  }))
);