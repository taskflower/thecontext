import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  TYPES, 
  AppState, 
  Workspace,
  Scenario, 
  FlowNode,
  Edge,
  Position,
} from './types';

export const useAppStore = create<AppState>()(
  immer((set, get) => ({
    // Initial state
    items: [
      {
        id: 'workspace1', type: TYPES.WORKSPACE, title: 'Project Alpha',
        children: [
          {
            id: 'scenario1', type: TYPES.SCENARIO, name: 'Main Flow', description: 'Primary user journey',
            children: [
              { id: 'node1', type: TYPES.NODE, label: 'Start', value: 100, position: { x: 100, y: 100 } },
              { id: 'node2', type: TYPES.NODE, label: 'Process', value: 250, position: { x: 300, y: 200 } }
            ],
            edges: [
              { id: 'edge1', type: TYPES.EDGE, source: 'node1', target: 'node2', label: 'Flow' }
            ]
          }
        ]
      }
    ],
    selected: { workspace: 'workspace1', scenario: 'scenario1', node: '' },
    stateVersion: 0,

    // Actions
    selectWorkspace: (workspaceId: string) => set((state) => {
      state.selected.workspace = workspaceId;
      const workspace = state.items.find((w) => w.id === workspaceId);
      if (workspace?.children && workspace.children.length > 0) {
        state.selected.scenario = workspace.children[0].id;
      } else {
        state.selected.scenario = '';
      }
      state.selected.node = '';
      state.stateVersion++;
    }),

    selectScenario: (scenarioId: string) => set((state) => {
      state.selected.scenario = scenarioId;
      state.selected.node = '';
      state.stateVersion++;
    }),

    selectNode: (nodeId: string) => set((state) => {
      state.selected.node = nodeId;
      state.stateVersion++;
    }),

    addWorkspace: (payload: { title: string }) => set((state) => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`, 
        type: TYPES.WORKSPACE,
        title: payload.title, 
        children: []
      };
      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.selected.node = '';
      state.stateVersion++;
    }),

    addScenario: (payload: { name: string, description: string }) => set((state) => {
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`, 
        type: TYPES.SCENARIO,
        name: payload.name, 
        description: payload.description, 
        children: [],
        edges: []
      };
      
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      if (workspace) {
        workspace.children.push(newScenario);
        state.selected.scenario = newScenario.id;
        state.selected.node = '';
      }
      state.stateVersion++;
    }),

    addNode: (payload: { label: string, value: string | number, position?: Position }) => set((state) => {
      const newNode: FlowNode = {
        id: `node-${Date.now()}`, 
        type: TYPES.NODE,
        label: payload.label, 
        value: Number(payload.value),
        position: payload.position || { x: 100, y: 100 }
      };
      
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      const scenario = workspace?.children.find((s) => s.id === state.selected.scenario);
      if (scenario) {
        scenario.children.push(newNode);
        state.selected.node = newNode.id;
        state.stateVersion++;
      }
    }),

    addEdge: (payload: { source: string, target: string, label?: string, type?: string }) => set((state) => {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        type: payload.type || TYPES.EDGE, // Use provided type or default to TYPES.EDGE
        source: payload.source,
        target: payload.target,
        label: payload.label || ''
      };
      
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      const scenario = workspace?.children.find((s) => s.id === state.selected.scenario);
      if (scenario) {
        if (!scenario.edges) scenario.edges = [];
        scenario.edges.push(newEdge);
        state.stateVersion++;
      }
    }),

    updateNodePosition: (nodeId: string, position: Position) => set((state) => {
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      const scenario = workspace?.children.find((s) => s.id === state.selected.scenario);
      const node = scenario?.children.find((n) => n.id === nodeId);
      if (node) {
        node.position = position;
        state.stateVersion++;
      }
    }),

    deleteWorkspace: (workspaceId: string) => set((state) => {
      const index = state.items.findIndex((w) => w.id === workspaceId);
      if (index !== -1) {
        state.items.splice(index, 1);
        
        if (workspaceId === state.selected.workspace) {
          if (state.items.length > 0) {
            state.selected.workspace = state.items[0].id;
            state.selected.scenario = state.items[0].children?.[0]?.id || '';
          } else {
            state.selected.workspace = '';
            state.selected.scenario = '';
          }
          state.selected.node = '';
        }
        state.stateVersion++;
      }
    }),

    deleteScenario: (scenarioId: string) => set((state) => {
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      if (workspace) {
        const index = workspace.children.findIndex((s) => s.id === scenarioId);
        if (index !== -1) {
          workspace.children.splice(index, 1);
          
          if (scenarioId === state.selected.scenario) {
            if (workspace.children.length > 0) {
              state.selected.scenario = workspace.children[0].id;
            } else {
              state.selected.scenario = '';
            }
            state.selected.node = '';
          }
          state.stateVersion++;
        }
      }
    }),

    deleteNode: (nodeId: string) => set((state) => {
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      const scenario = workspace?.children.find((s) => s.id === state.selected.scenario);
      if (scenario) {
        const index = scenario.children.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);
          // Remove connected edges
          if (scenario.edges) {
            scenario.edges = scenario.edges.filter(
              (edge) => edge.source !== nodeId && edge.target !== nodeId
            );
          }
          
          if (nodeId === state.selected.node) {
            state.selected.node = '';
          }
          state.stateVersion++;
        }
      }
    }),

    deleteEdge: (edgeId: string) => set((state) => {
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      const scenario = workspace?.children.find((s) => s.id === state.selected.scenario);
      if (scenario?.edges) {
        const index = scenario.edges.findIndex((e) => e.id === edgeId);
        if (index !== -1) {
          scenario.edges.splice(index, 1);
          state.stateVersion++;
        }
      }
    }),

    getActiveScenarioData: () => {
      const state = get();
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      if (!workspace) return { nodes: [], edges: [] };
      
      const scenario = workspace.children.find((s) => s.id === state.selected.scenario);
      if (!scenario) return { nodes: [], edges: [] };
      
      const nodes = scenario.children.map((node) => ({
        id: node.id,
        data: { 
          label: `${node.label} (${node.value})`,
          nodeId: node.id 
        },
        position: node.position,
        selected: node.id === state.selected.node
      }));
      
      const edges = scenario.edges?.map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label
      })) || [];
      
      return { nodes, edges };
    },
    
    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find((w) => w.id === state.selected.workspace);
      if (!workspace) return null;
      return workspace.children.find((s) => s.id === state.selected.scenario) || null;
    }
  }))
);