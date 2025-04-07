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
    const { nodeManager, flowState, contextItems } = get();
    const nodes = get().getNodes();
    
    if (flowState.currentIndex >= nodes.length || !nodes[flowState.currentIndex]) {
      console.log("Cannot execute next step: index out of bounds or node not found");
      return;
    }
    
    const currentNode = nodes[flowState.currentIndex];
    console.log("Executing node:", currentNode.id, "with input:", flowState.userInput);
    
    // Wykonaj węzeł i zaktualizuj kontekst - używamy ID z aktualnego węzła
    const result = nodeManager.executeNode(
      currentNode.id, 
      flowState.userInput, 
      contextItems
    );
    
    console.log("Node execution result:", result);
    
    // Upewnij się, że result istnieje
    if (result) {
      set(state => {
        // Przejdź do następnego węzła
        const newState: Partial<AppStore> = {
          flowState: { 
            currentIndex: Math.min(state.flowState.currentIndex + 1, nodes.length - 1), 
            userInput: '' 
          }
        };
        
        // Aktualizuj kontekst, jeśli został zmieniony
        if (result.contextUpdated) {
          console.log("Updating context with:", result.updatedContext);
          newState.contextItems = result.updatedContext;
        }
        
        return newState as any;
      });
      
      // Daj czas na aktualizację stanu, a następnie przygotuj nowy węzeł
      setTimeout(() => {
        const updatedNodes = get().getNodes();
        const updatedIndex = get().flowState.currentIndex;
        
        if (updatedIndex < updatedNodes.length) {
          const nextNode = updatedNodes[updatedIndex];
          
          try {
            // Przygotuj nowy węzeł z zaktualizowanym kontekstem
            const preparedNode = nodeManager.prepareNodeForDisplay(
              nextNode.id, 
              get().contextItems
            );
            
            console.log("Prepared next node:", preparedNode);
            
            // Ustaw przygotowany węzeł jako aktualny
            set({ currentFlowNode: preparedNode });
          } catch (error) {
            console.error("Error preparing next node:", error);
            set({ currentFlowNode: nextNode });
          }
        }
      }, 10);
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
      }, 10);
    }
  },
  
  finishFlow: () => {
    const { nodeManager, flowState, contextItems, currentFlowNode } = get();
    if (!currentFlowNode) {
      console.log("Cannot finish flow: currentFlowNode is null");
      return;
    }
    
    console.log("Finishing flow, executing node:", currentFlowNode.id);
    
    // Wykonaj węzeł i zaktualizuj kontekst
    const result = nodeManager.executeNode(currentFlowNode.id, flowState.userInput, contextItems);
    
    console.log("Final node execution result:", result);
    
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