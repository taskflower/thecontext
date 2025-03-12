import { useScenarioStore } from "./scenarioStore";
import { useScenariosMultiStore } from "./scenariosMultiStore";
import { shallow } from "zustand/shallow";

// Set up a subscription to sync changes from scenarioStore to scenariosMultiStore
export const initScenarioSync = () => {
  // Keep track of the previous state for comparison
  let prevNodes = Object.keys(useScenarioStore.getState().nodes).length;
  let prevEdges = useScenarioStore.getState().edges.length;
  
  // Subscribe to changes in the scenarioStore using shallow comparison
  useScenarioStore.subscribe(
    (state) => {
      const currentNodes = Object.keys(state.nodes).length;
      const currentEdges = state.edges.length;
      
      // Only sync if there's a meaningful change
      if (currentNodes !== prevNodes || currentEdges !== prevEdges) {
        // Update prev values
        prevNodes = currentNodes;
        prevEdges = currentEdges;
        
        // Sync active scenario back to current scenario in multi-store
        useScenariosMultiStore.getState().syncActiveScenarioToCurrent();
      }
    },
    (state) => [state.nodes, state.edges], // Select the state slices to watch
    shallow // Perform shallow equality check
  );
};