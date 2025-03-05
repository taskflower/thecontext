// src/store/dataStore.types.ts
import { DocItem, Folder, Scenario, ConnectionType } from '@/types';

// Typ dla rezultatu operacji
export type OperationResult<T = void> = {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DataState {
  getScenarioById(scenarioId: string): Scenario | undefined;
  // Data collections
  folders: Folder[];
  docItems: DocItem[];
  scenarios: Scenario[];
  
  // Validation helpers
  isFolderNameUnique: (name: string, parentId: string | null, excludeFolderId?: string) => boolean;
  isScenarioNameUnique: (name: string, excludeScenarioId?: string) => boolean;
  
  // Scenario actions
  addScenario: (scenario: Scenario) => OperationResult<string>;
  updateScenario: (id: string, updates: Partial<Scenario>) => OperationResult;
  deleteScenario: (id: string) => OperationResult;
  addScenarioConnection: (scenarioId: string, connectedId: string, connectionType?: ConnectionType) => OperationResult;
  removeScenarioConnection: (scenarioId: string, connectedId: string) => OperationResult;
  getConnectedScenarios: (scenarioId: string) => Scenario[];
  
  // Other data actions
  addFolder: (folder: Folder) => OperationResult<string>;
  deleteFolder: (id: string) => OperationResult;
  addDocItem: (docItem: DocItem) => OperationResult<string>;
  updateDocItem: (id: string, updates: Partial<DocItem>) => OperationResult;
  
  // Helper functions
  getChildFolders: (parentId: string) => Folder[];
  getDocItemsInFolder: (folderId: string) => DocItem[];
  getDocItem: (docItemId: string) => DocItem | undefined;
  getFolderPath: (folderId: string) => Folder[];
  searchDocItems: (query: string) => DocItem[];
}