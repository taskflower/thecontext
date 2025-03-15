// src/store/index.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { 
  AppState, ElementType, Workspace, Scenario, 
  Node, Edge, FlowData, Position, 
  ReactFlowEdge
} from '../types/app';

// Początkowy stan aplikacji
const initialState: AppState = {
  items: [
    {
      id: 'workspace1', type: ElementType.WORKSPACE, title: 'Project Alpha',
      children: [
        {
          id: 'scenario1', type: ElementType.SCENARIO, name: 'Main Flow', description: 'Primary user journey',
          children: [
            { id: 'node1', type: ElementType.NODE, label: 'Start', value: 100, position: { x: 100, y: 100 } },
            { id: 'node2', type: ElementType.NODE, label: 'Process', value: 250, position: { x: 300, y: 200 } }
          ],
          edges: [
            { id: 'edge1', source: 'node1', target: 'node2', label: 'Flow' }
          ]
        }
      ]
    }
  ],
  selected: { workspace: 'workspace1', scenario: 'scenario1' },
  stateVersion: 0,
  currentNodes: [],
  currentEdges: []
};

// Rozszerzenie interfejsu AppState o akcje i dodatkowe pola
interface StoreActions {
  // Workspace actions
  selectWorkspace: (workspaceId: string) => void;
  addWorkspace: (payload: { title: string }) => void;
  deleteWorkspace: (workspaceId: string) => void;
  
  // Scenario actions
  selectScenario: (scenarioId: string) => void;
  addScenario: (payload: { name: string; description?: string }) => void;
  deleteScenario: (scenarioId: string) => void;
  getCurrentScenario: () => Scenario | null;
  
  // Node actions
  addNode: (payload: { label: string; value: string | number; position?: Position }) => void;
  deleteNode: (nodeId: string) => void;
  updateNodePosition: (nodeId: string, position: Position) => void;
  
  // Edge actions
  addEdge: (payload: { source: string; target: string; label?: string }) => void;
  deleteEdge: (edgeId: string) => void;
  
  // Flow actions
  getActiveScenarioData: () => FlowData;
  
  // Pomocnicza metoda do aktualizacji derived state
  updateDerivedState: () => void;
}

// Poprawiamy interfejs AppState, dodając pola dla bieżących węzłów i krawędzi
declare module '../types/app' {
  interface AppState {
    currentNodes: Node[];
    currentEdges: Edge[];
  }
}

// Utworzenie store'a z typem
export const useAppStore = create<AppState & StoreActions>()(
  immer<AppState & StoreActions>((set, get) => ({
    ...initialState,
    
    // Pomocnicza funkcja do aktualizacji danych pochodnych
    updateDerivedState: () => set(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      
      state.currentNodes = scenario?.children || [];
      state.currentEdges = scenario?.edges || [];
    }),
    
    // Workspace actions
    selectWorkspace: (workspaceId) => set(state => {
      state.selected.workspace = workspaceId;
      const workspace = state.items.find(w => w.id === workspaceId);
      
      if ((workspace?.children ?? []).length > 0) {
        state.selected.scenario = workspace?.children?.[0]?.id || '';
        
        // Bezpośrednio aktualizuj listy
        const scenario = workspace?.children[0];
        state.currentNodes = scenario?.children || [];
        state.currentEdges = scenario?.edges || [];
      } else {
        state.selected.scenario = '';
        // Wyczyść listy gdy nie ma scenariusza
        state.currentNodes = [];
        state.currentEdges = [];
      }
      state.stateVersion++;
    }),
    
    addWorkspace: (payload) => set(state => {
      const newWorkspace: Workspace = {
        id: `workspace-${Date.now()}`, 
        type: ElementType.WORKSPACE,
        title: payload.title, 
        children: []
      };
      state.items.push(newWorkspace);
      state.selected.workspace = newWorkspace.id;
      state.selected.scenario = '';
      state.stateVersion++;
      state.currentNodes = [];
      state.currentEdges = [];
    }),
    
    deleteWorkspace: (workspaceId) => set(state => {
      const index = state.items.findIndex(w => w.id === workspaceId);
      if (index !== -1) {
        state.items.splice(index, 1);
        
        if (workspaceId === state.selected.workspace) {
          if (state.items.length > 0) {
            state.selected.workspace = state.items[0].id;
            state.selected.scenario = state.items[0]?.children?.[0]?.id || '';
            
            // Bezpośrednio aktualizuj listy
            const newScenario = state.items[0]?.children?.find(s => s.id === state.selected.scenario);
            state.currentNodes = newScenario?.children || [];
            state.currentEdges = newScenario?.edges || [];
          } else {
            state.selected.workspace = '';
            state.selected.scenario = '';
            
            // Wyczyść listy gdy nie ma żadnego workspace
            state.currentNodes = [];
            state.currentEdges = [];
          }
        }
        state.stateVersion++;
      }
    }),
    
    // Scenario actions
    selectScenario: (scenarioId) => set(state => {
      state.selected.scenario = scenarioId;
      
      // Bezpośrednio aktualizuj listy
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === scenarioId);
      state.currentNodes = scenario?.children || [];
      state.currentEdges = scenario?.edges || [];
      
      state.stateVersion++;
    }),
    
    addScenario: (payload) => set(state => {
      const newScenario: Scenario = {
        id: `scenario-${Date.now()}`, 
        type: ElementType.SCENARIO,
        name: payload.name, 
        description: payload.description, 
        children: [],
        edges: []
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (workspace) {
        // Sprawdzamy czy children istnieje
        if (!workspace.children) {
          workspace.children = [];
        }
        workspace.children.push(newScenario);
        state.selected.scenario = newScenario.id;
        
        // Puste listy dla nowego scenariusza
        state.currentNodes = [];
        state.currentEdges = [];
      }
      state.stateVersion++;
    }),
    
    deleteScenario: (scenarioId) => set(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (workspace?.children) {
        const index = workspace.children.findIndex(s => s.id === scenarioId);
        if (index !== -1) {
          workspace.children.splice(index, 1);
          
          if (scenarioId === state.selected.scenario) {
            if (workspace?.children?.length > 0) {
              state.selected.scenario = workspace?.children?.[0]?.id;
              
              // Bezpośrednio aktualizuj listy
              const newScenario = workspace?.children?.[0];
              state.currentNodes = newScenario?.children || [];
              state.currentEdges = newScenario?.edges || [];
            } else {
              state.selected.scenario = '';
              
              // Wyczyść listy gdy nie ma scenariuszy
              state.currentNodes = [];
              state.currentEdges = [];
            }
          }
          state.stateVersion++;
        }
      }
    }),
    
    getCurrentScenario: () => {
      const state = get();
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      if (!workspace) return null;
      return workspace.children?.find(s => s.id === state.selected.scenario) || null;
    },
    
    // Node actions
    addNode: (payload) => set(state => {
      const newNode: Node = {
        id: `node-${Date.now()}`, 
        type: ElementType.NODE,
        label: payload.label, 
        value: Number(payload.value),
        position: payload.position || { x: 100, y: 100 }
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario) {
        // Sprawdzamy czy children istnieje
        if (!scenario.children) {
          scenario.children = [];
        }
        scenario.children.push(newNode);
        
        // Bezpośrednio aktualizuj listę węzłów
        state.currentNodes = scenario.children;
        
        state.stateVersion++;
      }
    }),
    
    deleteNode: (nodeId) => set(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario?.children) {
        const index = scenario.children.findIndex(n => n.id === nodeId);
        if (index !== -1) {
          scenario.children.splice(index, 1);
          
          // Sprawdzamy czy edges istnieje
          if (!scenario.edges) {
            scenario.edges = [];
          } else {
            // Remove connected edges
            scenario.edges = scenario.edges.filter(
              edge => edge.source !== nodeId && edge.target !== nodeId
            );
          }
          
          // Bezpośrednio aktualizuj listy
          state.currentNodes = scenario.children;
          state.currentEdges = scenario.edges;
          
          state.stateVersion++;
        }
      }
    }),
    
    updateNodePosition: (nodeId, position) => set(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      const node = scenario?.children?.find(n => n.id === nodeId);
      if (node) {
        node.position = position;
        state.stateVersion++;
      }
    }),
    
    // Edge actions
    addEdge: (payload) => set(state => {
      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: payload.source,
        target: payload.target,
        label: payload.label
      };
      
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario) {
        // Sprawdzamy czy edges istnieje
        if (!scenario.edges) {
          scenario.edges = [];
        }
        scenario.edges.push(newEdge);
        
        // Bezpośrednio aktualizuj listę krawędzi
        state.currentEdges = scenario.edges;
        
        state.stateVersion++;
      }
    }),
    
    deleteEdge: (edgeId) => set(state => {
      const workspace = state.items.find(w => w.id === state.selected.workspace);
      const scenario = workspace?.children?.find(s => s.id === state.selected.scenario);
      if (scenario?.edges) {
        const index = scenario.edges.findIndex(e => e.id === edgeId);
        if (index !== -1) {
          scenario.edges.splice(index, 1);
          
          // Bezpośrednio aktualizuj listę krawędzi
          state.currentEdges = scenario.edges;
          
          state.stateVersion++;
        }
      }
    }),
    
    // Flow actions
    getActiveScenarioData: () => {
      const scenario = get().getCurrentScenario();
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
  }))
);

// Wywołujemy updateDerivedState podczas inicjalizacji store
useAppStore.getState().updateDerivedState();