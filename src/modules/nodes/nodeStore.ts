import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ElementType, GraphEdge, GraphNode, Position, Scenario, Workspace } from '../types';
import { useWorkspaceStore } from '../workspaces';


export interface NodeState {
  currentNodes: GraphNode[];
  
  getCurrentNodes: () => GraphNode[];
  addNode: (payload: { label: string; value: number; position?: Position }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
}

export const useNodeStore = create<NodeState>()(
  immer((set) => ({
    currentNodes: [] as GraphNode[],
    
    getCurrentNodes: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      return scenario?.children || [];
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
      const workspace = newItems.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      
      if (scenario) {
        if (!scenario.children) {
          scenario.children = [];
        }
        scenario.children.push(newNode);
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
        
        set(state => {
          state.currentNodes = [...scenario.children];
        });
      }
    },
    
    deleteNode: (nodeId) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      
      if (scenario?.children) {
        const index = scenario.children.findIndex((n: GraphNode) => n.id === nodeId);
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
          
          set(state => {
            state.currentNodes = [...scenario.children];
          });
        }
      }
    },
    
    updateNodePosition: (nodeId, position) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = JSON.parse(JSON.stringify(items));
      const workspace = newItems.find((w: Workspace) => w.id === selected.workspace);
      const scenario = workspace?.children?.find((s: Scenario) => s.id === selected.scenario);
      const node = scenario?.children?.find((n: GraphNode) => n.id === nodeId);
      
      if (node) {
        node.position = position;
        
        useWorkspaceStore.setState({
          items: newItems,
          stateVersion: stateVersion + 1
        });
      }
    },
  }))
);