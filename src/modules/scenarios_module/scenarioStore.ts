
// src/modules/scenarioStore.ts
import { create } from 'zustand';
import { useGraphStore } from '../graph_module/graphStore';


interface Node {
  id: string;
  message: string;
  category: string;
  scenarioData?: Scenario; // For scenario nodes
}

interface Edge {
  source: string;
  target: string;
}

export interface Scenario {
  name: string;
  description: string;
  nodes: Record<string, Node>;
  edges: Edge[];
}

interface ScenarioState {
  scenarios: Scenario[];
  
  // Actions for scenarios
  setScenarios: (scenarios: Scenario[]) => void;
  addScenario: (scenario: Scenario) => void;
  removeScenario: (index: number) => void;
  
  // Import scenario to graph
  importScenarioAsNode: (scenarioIndex: number, mountPoint: string, prefix?: string) => void;
  
  // Export/Import scenarios
  exportScenariosToJson: () => Scenario[];
  importScenariosFromJson: (data: Scenario[]) => void;
}

export const useScenarioStore = create<ScenarioState>((set, get) => ({
  // Sample scenarios
  scenarios: [
    {
      name: 'Example Scenario',
      description: 'Prosty scenariusz z dwoma krokami',
      nodes: {
        'node1': { id: 'node1', message: 'Pierwszy węzeł scenariusza', category: 'default' },
        'node2': { id: 'node2', message: 'Drugi węzeł scenariusza', category: 'default' }
      },
      edges: [{ source: 'node1', target: 'node2' }]
    }
  ],
  
  // Scenario actions
  setScenarios: (scenarios) => set({ scenarios }),
  
  addScenario: (scenario) => set((state) => ({
    scenarios: [...state.scenarios, scenario]
  })),
  
  removeScenario: (index) => set((state) => ({
    scenarios: state.scenarios.filter((_, i) => i !== index)
  })),
  
  // Import scenario to graph
  importScenarioAsNode: (scenarioIndex, mountPoint, prefix = 'imported') => {
    const scenario = get().scenarios[scenarioIndex];
    if (scenario) {
      const scenarioNodeId = `${prefix}.scenario.${scenario.name.replace(/\s+/g, '_')}`;
      const scenarioNode = {
        id: scenarioNodeId,
        message: `Scenariusz: ${scenario.name}\n${scenario.description || ''}`,
        category: 'scenario',
        scenarioData: scenario,
      };
      
      // Access graphStore to add the node and edge
      useGraphStore.getState().addNode(
        scenarioNodeId, 
        scenarioNode.message, 
        'scenario', 
        scenario
      );
      
      useGraphStore.getState().addEdge(mountPoint, scenarioNodeId);
    }
  },
  
  // Export/Import scenarios
  exportScenariosToJson: () => {
    return get().scenarios;
  },
  
  importScenariosFromJson: (data) => {
    if (Array.isArray(data)) {
      set({ scenarios: data });
    }
  }
}));