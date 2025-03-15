import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { ElementType, Scenario } from '../types';
import { useWorkspaceStore } from '../workspaces';




export interface ScenarioState {
  getCurrentScenario: () => Scenario | null;
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: { name: string; description?: string }) => void;
  deleteScenario: (scenarioId: string) => void;
}

export const useScenarioStore = create<ScenarioState>()(
  immer((set) => ({
    getCurrentScenario: () => {
      const { items, selected } = useWorkspaceStore.getState();
      const workspace = items.find(w => w.id === selected.workspace);
      if (!workspace) return null;
      return workspace.children?.find(s => s.id === selected.scenario) || null;
    },
    
    selectScenario: (scenarioId) => set(() => {
      const { selected, stateVersion } = useWorkspaceStore.getState();
      useWorkspaceStore.setState({
        selected: { ...selected, scenario: scenarioId },
        stateVersion: stateVersion + 1
      });
    }),
    
    addScenario: (payload) => set(() => {
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
      }
    }),
    
    deleteScenario: (scenarioId) => set(() => {
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
        }
      }
    }),
  }))
);