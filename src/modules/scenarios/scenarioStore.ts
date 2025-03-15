import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ElementType, Scenario } from '../types';
import { useWorkspaceStore } from '../workspaces';
import { useNodeStore } from '../nodes/nodeStore';
import { useEdgeStore } from '../edges/edgeStore';

export interface ScenarioState {
  currentScenario: Scenario | null;
  
  refreshCurrentScenario: () => void;
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: { name: string; description?: string }) => void;
  deleteScenario: (scenarioId: string) => void;
}

export const useScenarioStore = create<ScenarioState>()(
  immer((set) => ({
    currentScenario: null,
    
    refreshCurrentScenario: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find(w => w.id === selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === selected.scenario) || null;
      set({ currentScenario: scenario });
    },
    
    selectScenario: (scenarioId) => {
      const { selected, stateVersion } = useWorkspaceStore.getState();
      
      useWorkspaceStore.setState({
        selected: { ...selected, scenario: scenarioId },
        stateVersion: stateVersion + 1
      });
      
      // Refresh dependent stores
      const nodeStore = useNodeStore.getState();
      const edgeStore = useEdgeStore.getState();
      
      setTimeout(() => {
        nodeStore.refreshNodes();
        edgeStore.refreshEdges();
      }, 0);
      
      set(() => ({ currentScenario: null }));
    },
    
    addScenario: (payload) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`, 
        type: ElementType.SCENARIO,
        name: payload.name, 
        description: payload.description, 
        children: [],
        edges: []
      };
      
      const newItems = [...items];
      const workspace = newItems.find(w => w.id === selected.workspace);
      
      if (workspace) {
        if (!workspace.children) {
          workspace.children = [];
        }
        workspace.children.push(newScenario);
        
        useWorkspaceStore.setState({
          items: newItems,
          selected: { ...selected, scenario: newScenario.id },
          stateVersion: stateVersion + 1
        });
        
        set({ currentScenario: newScenario });
        
        // Refresh dependent stores
        const nodeStore = useNodeStore.getState();
        const edgeStore = useEdgeStore.getState();
        
        setTimeout(() => {
          nodeStore.refreshNodes();
          edgeStore.refreshEdges();
        }, 0);
      }
    }),
    
    deleteScenario: (scenarioId) => {
      const { items, selected, stateVersion } = useWorkspaceStore.getState();
      
      const newItems = [...items];
      const workspace = newItems.find(w => w.id === selected.workspace);
      
      if (workspace?.children) {
        const index = workspace.children.findIndex(s => s.id === scenarioId);
        if (index !== -1) {
          workspace.children.splice(index, 1);
          
          const newSelected = { ...selected };
          if (scenarioId === selected.scenario) {
            if (workspace.children.length > 0) {
              newSelected.scenario = workspace.children[0].id;
            } else {
              newSelected.scenario = '';
            }
          }
          
          useWorkspaceStore.setState({
            items: newItems,
            selected: newSelected,
            stateVersion: stateVersion + 1
          });
          
          set({ currentScenario: null });
          
          // Clear dependent stores
          const nodeStore = useNodeStore.getState();
          const edgeStore = useEdgeStore.getState();
          
          setTimeout(() => {
            nodeStore.refreshNodes();
            edgeStore.refreshEdges();
          }, 0);
        }
      }
    }),
  }))
);