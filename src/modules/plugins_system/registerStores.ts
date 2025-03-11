/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins_system/registerStores.ts
import { useScenarioStore } from '../scenarios_module/scenarioStore';
import { useWorkspaceStore } from '../workspace_module/workspaceStore';


/**
 * Registers store objects to window for plugin access
 * This is a workaround to avoid require() style imports in plugins
 */
export const registerStores = () => {
  // Make stores available on window object
  (window as any).useScenarioStore = useScenarioStore;
  (window as any).workspaceStore = useWorkspaceStore;
};

// Add this to your app initialization
// For example, in main.tsx or App.tsx
// import { registerStores } from './modules/plugins_system/registerStores';
// registerStores();