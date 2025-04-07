/* eslint-disable @typescript-eslint/no-explicit-any */
// store/slices/flowStore.ts
import { StateCreator } from 'zustand';
import { AppStore, FlowExecutionState, FlowActions } from '../types';

const createFlowSlice: StateCreator<
  AppStore,
  [],
  [],
  FlowExecutionState & FlowActions
> = (set, get) => ({
  // Stan początkowy
  flowState: { currentIndex: 0, userInput: '' },
  
  // Akcje
  updateFlowInput: (userInput) => set(state => ({ 
    flowState: { ...state.flowState, userInput } 
  })),
  
  nextStep: () => {
    const { nodeManager, flowState, contextItems, currentFlowNode } = get();
    if (!currentFlowNode) return;
    
    // Wykonaj węzeł i zaktualizuj kontekst
    const result = nodeManager.executeNode(currentFlowNode.id, flowState.userInput, contextItems);
    const nodes = get().getNodes();
    
    if (flowState.currentIndex < nodes.length - 1) {
      set(state => {
        const newState: Partial<AppStore> = {
          flowState: { currentIndex: state.flowState.currentIndex + 1, userInput: '' },
        };
        
        if (result?.contextUpdated) {
          newState.contextItems = result.updatedContext;
        }
        
        return newState as any;
      });
      
      // Przygotuj następny węzeł po zaktualizowaniu stanu
      setTimeout(() => {
        get().prepareCurrentNode();
      }, 0);
    }
  },
  
  prevStep: () => {
    const { flowState } = get();
    
    if (flowState.currentIndex > 0) {
      set(state => ({
        flowState: { ...state.flowState, currentIndex: flowState.currentIndex - 1 }
      }));
      
      // Przygotuj poprzedni węzeł po zaktualizowaniu stanu
      setTimeout(() => {
        get().prepareCurrentNode();
      }, 0);
    }
  },
  
  finishFlow: () => {
    const { nodeManager, flowState, contextItems, currentFlowNode } = get();
    if (!currentFlowNode) return;
    
    // Wykonaj węzeł i zaktualizuj kontekst
    const result = nodeManager.executeNode(currentFlowNode.id, flowState.userInput, contextItems);
    
    set(() => {
      const newState: Partial<AppStore> = {
        view: 'scenarios'
      };
      
      if (result?.contextUpdated) {
        newState.contextItems = result.updatedContext;
      }
      
      return newState as any;
    });
  }
});

export default createFlowSlice;