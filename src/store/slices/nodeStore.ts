/* eslint-disable @typescript-eslint/no-explicit-any */
// store/slices/nodeStore.ts
import { StateCreator } from 'zustand';
import { AppStore, NodeState, NodeActions } from '../types';

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
    const { nodeManager, flowState, contextItems } = get();
    const nodes = get().getNodes();
    
    if (!nodes.length || flowState.currentIndex >= nodes.length) {
      set({ currentFlowNode: null });
      return;
    }
    
    const currentNode = nodes[flowState.currentIndex];
    if (!currentNode) {
      set({ currentFlowNode: null });
      return;
    }
    
    try {
      const preparedNode = nodeManager.prepareNodeForDisplay(currentNode.id, contextItems);
      set({ currentFlowNode: preparedNode });
    } catch (error) {
      console.error("Error preparing node:", error);
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
    const { nodeForm, selectedIds, nodeManager } = get();
    if (!nodeForm) return;
    
    nodeManager.updateNode(nodeForm.id, nodeForm);
    
    set(state => ({
      workspaces: state.workspaces.map(w => 
        w.id === selectedIds.workspace ? {
          ...w, 
          scenarios: w.scenarios.map(s => 
            s.id === selectedIds.scenario ? {
              ...s, 
              nodes: s.nodes.map(n => 
                n.id === nodeForm.id ? nodeForm : n
              )
            } : s
          )
        } : w
      ),
      nodeForm: null,
      selectedIds: { ...state.selectedIds, node: null },
      view: 'flow'
    }));
  },
  
  deleteNode: (id) => {
    const { selectedIds, nodeManager } = get();
    
    nodeManager.removeNode(id);
    
    set(state => {
      const newState: Partial<AppStore> = {
        workspaces: state.workspaces.map(w => 
          w.id === selectedIds.workspace ? {
            ...w, 
            scenarios: w.scenarios.map(s => 
              s.id === selectedIds.scenario ? {
                ...s, 
                nodes: s.nodes.filter(n => n.id !== id)
              } : s
            )
          } : w
        )
      };
      
      if (selectedIds.node === id) {
        newState.selectedIds = { ...selectedIds, node: null };
        newState.view = 'flow';
      }
      
      return newState as any;
    });
  }
});

export default createNodeSlice;