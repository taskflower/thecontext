import { Scenario } from "@/types";

// src/store/scenarioStore.types.ts
export interface ScenarioState {
  // Dane
  scenarios: Scenario[];
  
  // Proste akcje CRUD - atomowe operacje na stanie
  getScenarioById: (scenarioId: string) => Scenario | undefined;
  addScenario: (scenario: Scenario) => void;
  updateScenario: (id: string, updates: Partial<Scenario>) => boolean;
  deleteScenario: (id: string) => boolean;
  
  // Dodatkowe proste operacje na powiązaniach - bez logiki biznesowej
  addConnection: (scenarioId: string, connectedId: string) => boolean;
  removeConnection: (scenarioId: string, connectedId: string) => boolean;
  updateConnectionType: (scenarioId: string, connectionType: string) => boolean;
}