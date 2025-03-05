// src/store/scenarioStore.types.ts
import { Scenario, ConnectionType } from '@/types';
import { OperationResult } from './dataStore.types';

export interface ScenarioState {
  // Data collection
  scenarios: Scenario[];
  
  // Validation helpers
  isScenarioNameUnique: (name: string, excludeScenarioId?: string) => boolean;
  
  // Scenario actions
  getScenarioById: (scenarioId: string) => Scenario | undefined;
  addScenario: (scenario: Scenario) => OperationResult<string>;
  updateScenario: (id: string, updates: Partial<Scenario>) => OperationResult;
  deleteScenario: (id: string) => OperationResult;
  
  // Connection management
  addScenarioConnection: (scenarioId: string, connectedId: string, connectionType?: ConnectionType) => OperationResult;
  removeScenarioConnection: (scenarioId: string, connectedId: string) => OperationResult;
  getConnectedScenarios: (scenarioId: string) => Scenario[];
}