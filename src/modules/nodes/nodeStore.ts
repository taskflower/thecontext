import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ElementType, GraphEdge, GraphNode, Position } from '../types';
import { useWorkspaceStore } from '../workspaces';

export interface NodeState {
  nodes: GraphNode[];
  
  refreshNodes: () => void;
  addNode: (payload: { label: string; value: number; position?: Position }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
}

export const useNodeStore = create<NodeState>()(
  immer((set) => ({
    nodes: [],
    
    refreshNodes: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      set({ nodes: scenario?.children || [] });
    },
    
    addNode: (payload) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newNode: GraphNode = {
        id: `node-${Date.now()}`, 
        type: ElementType.GRAPH_NODE,
        label: payload.label, 
        value: payload.value,
        position: payload.position || { x: 100, y: 100 }
      };
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      
      if (scenario) {
        if (!scenario.children) {
          scenario.children = [];
        }
        scenario.children.push(newNode);
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
        
        // Update local store
        set(state => {
          state.nodes = [...scenario.children];
        });
      }
    },
    
    deleteNode: (nodeId) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      
      if (scenario?.children) {
        const index = scenario.children.findIndex(n => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);
          
          if (!scenario.edges) {
            scenario.edges = [];
          } else {
            // Remove related edges
            scenario.edges = scenario.edges.filter(
              (edge: GraphEdge) => edge.source !== nodeId && edge.target !== nodeId
            );
          }
          
          useWorkspaceStore.setState({
            items: newItems,
            stateVersion: stateVersion + 1
          });
          
          // Update local store
          set(state => {
            state.nodes = [...scenario.children];
          });
        }
      }
    },
    
    updateNodePosition: (nodeId, position) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario);
      const node = scenario?.children?.find(n => n.id === nodeId);
      
      if (node) {
        node.position = position;
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
        
        // Update local store
        set(state => {
          const nodeIndex = state.nodes.findIndex(n => n.id === nodeId);
          if (nodeIndex !== -1) {
            state.nodes[nodeIndex].position = position;
          }
        });
      }
    },
  }))
);