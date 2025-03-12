import { useScenarioStore } from "./scenarioStore";
import { useScenariosMultiStore } from "./scenariosMultiStore";

// Set up a subscription to sync changes from scenarioStore to scenariosMultiStore
export const initScenarioSync = () => {
  // Usunięte poprzednie śledzenie, zamiast tego użyjmy prostszego podejścia
  const unsubscribe = useScenarioStore.subscribe(() => {
    // Synchronizuj tylko gdy jest aktywny scenariusz
    const { currentScenarioId } = useScenariosMultiStore.getState();
    if (currentScenarioId) {
      useScenariosMultiStore.getState().syncActiveScenarioToCurrent();
    }
  });
  
  // Zwracamy funkcję wyrejestrowania, gdyby była potrzebna
  return unsubscribe;
};