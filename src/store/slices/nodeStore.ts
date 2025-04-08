/* eslint-disable @typescript-eslint/no-explicit-any */
// store/slices/nodeStore.ts
import { StateCreator } from 'zustand';
import { AppStore, NodeState, NodeActions, Node } from '../types';

const createNodeSlice: StateCreator<
  AppStore,
  [],
  [],
  NodeState & NodeActions
> = (set, get) => ({
  // Stan początkowy
  nodeForm: null,
  currentFlowNode: null,
  
  // Selektory
  getNodes: () => {
    return get().getScenario()?.nodes || [];
  },
  
  getNode: (id: string) => {
    return get().getNodes().find(n => n.id === id);
  },
  
  // Akcje
  prepareCurrentNode: () => {
    const { nodeManager, flowState, contextItems, applyNodePlugins } = get();
    const nodes = get().getNodes();
    
    if (!nodes.length || flowState.currentIndex >= nodes.length) {
      console.log("Cannot prepare node: index out of bounds or no nodes");
      set({ currentFlowNode: null });
      return;
    }
    
    const currentNode = nodes[flowState.currentIndex];
    if (!currentNode) {
      console.log("Cannot prepare node: current node is null");
      set({ currentFlowNode: null });
      return;
    }
    
    try {
      // Najpierw zastosuj transformacje pluginu do węzła
      console.log("Applying plugin transformations to node:", currentNode.id);
      const transformedNode = applyNodePlugins({...currentNode});
      
      // Pobierz węzeł z node managera
      console.log("Preparing node:", transformedNode.id, "with context:", contextItems);
      let preparedNode = nodeManager.prepareNodeForDisplay(transformedNode.id, contextItems);
      
      // Upewnij się, że przetworzony węzeł zachowuje informacje o pluginie
      if (preparedNode) {
        preparedNode = {
          ...preparedNode,
          pluginType: transformedNode.pluginType,
          pluginConfig: transformedNode.pluginConfig,
          pluginData: transformedNode.pluginData
        };
      }
      
      console.log("Prepared node with plugin data:", preparedNode);
      set({ currentFlowNode: preparedNode });
    } catch (error) {
      console.error("Error preparing node:", error, "Node:", currentNode);
      set({ currentFlowNode: currentNode });
    }
  },
  
  createNode: (label) => {
    const { selectedIds, nodeManager } = get();
    if (!selectedIds.scenario || !label.trim()) return;
    
    const newNode = {
      id: `node-${Date.now()}`,
      scenarioId: selectedIds.scenario,
      label,
      description: '',
      position: { x: 100, y: 100 + get().getNodes().length * 150 },
      assistantMessage: 'Wiadomość asystenta',
      contextKey: ''
    };
    
    nodeManager.addNode(newNode);
    
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === selectedIds.workspace ? {
          ...w, 
          scenarios: w.scenarios.map(s => 
            s.id === selectedIds.scenario ? {
              ...s, 
              nodes: [...s.nodes, newNode]
            } : s
          )
        } : w
      )
    }));
  },
  
  editNode: (id) => {
    const node = get().getNode(id);
    if (!node) return;
    
    set(state => ({
      selectedIds: { ...state.selectedIds, node: id },
      nodeForm: { ...node },
      view: 'nodeEditor'
    }));
  },
  
  updateNode: () => {
    const { nodeForm, selectedIds, nodeManager, applyNodePlugins } = get();
    if (!nodeForm) return;
    
    // Kopia formularza węzła
    const updatedNode: Node = { ...nodeForm };
    
    // Zastosuj transformacje pluginów - zamiast ręcznie definiować konfigurację
    if (updatedNode.pluginType) {
      const transformedNode = applyNodePlugins(updatedNode);
      // Zachowaj zaktualizowaną konfigurację pluginu (bezpieczne przypisanie)
      if (transformedNode.pluginConfig) {
        updatedNode.pluginConfig = transformedNode.pluginConfig;
      }
    }
    
    // Zaktualizuj węzeł w node managerze
    console.log("Updating node in node manager:", updatedNode);
    nodeManager.updateNode(updatedNode.id, updatedNode);
    
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === selectedIds.workspace ? {
          ...w, 
          scenarios: w.scenarios.map(s => 
            s.id === selectedIds.scenario ? {
              ...s, 
              nodes: s.nodes.map(n => 
                n.id === updatedNode.id ? updatedNode : n
              )
            } : s
          )
        } : w
      ),
      nodeForm: null,
      selectedIds: { ...state.selectedIds, node: null },
      view: 'flow'
    }));
    
    // Po zapisaniu węzła odświeżamy aktualny węzeł w flow
    setTimeout(() => {
      // Jeśli jesteśmy w widoku flow i węzeł, który edytowaliśmy jest aktualnym węzłem
      if (get().view === 'flow' && get().flowState.currentIndex < get().getNodes().length) {
        const currentNodeId = get().getNodes()[get().flowState.currentIndex].id;
        if (currentNodeId === updatedNode.id) {
          get().prepareCurrentNode();
        }
      }
    }, 100);
  },
  
  deleteNode: (id) => {
    const { selectedIds, nodeManager } = get();
    
    nodeManager.removeNode(id);
    
    set(state => {
      const newWorkspaces = state.workspaces.map(w => 
        w.id === selectedIds.workspace ? {
          ...w, 
          scenarios: w.scenarios.map(s => 
            s.id === selectedIds.scenario ? {
              ...s, 
              nodes: s.nodes.filter(n => n.id !== id)
            } : s
          )
        } : w
      );
      
      // Reset flow state if current node is deleted
      const newState: Partial<AppStore> = { workspaces: newWorkspaces };
      
      if (selectedIds.node === id) {
        newState.selectedIds = { ...selectedIds, node: null };
        newState.view = 'flow';
      }
      
      // Adjust current flow index if needed
      const currentScenario = newWorkspaces
        .find(w => w.id === selectedIds.workspace)
        ?.scenarios.find(s => s.id === selectedIds.scenario);
        
      if (currentScenario) {
        const currentNodes = currentScenario.nodes;
        const currentIndex = state.flowState.currentIndex;
        
        if (currentIndex >= currentNodes.length && currentNodes.length > 0) {
          newState.flowState = {
            ...state.flowState,
            currentIndex: currentNodes.length - 1
          };
        }
      }
      
      return newState as any;
    });
    
    // Update current flow node if needed
    setTimeout(() => {
      if (get().view === 'flow') {
        get().prepareCurrentNode();
      }
    }, 100);
  }
});

export default createNodeSlice;