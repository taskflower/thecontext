/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugin-system/types.ts
export interface PluginConfig {
    [key: string]: any;
  }
  
  export interface PluginState {
    config: PluginConfig;
    result: any;
  }
  
  export interface PluginModule {
    id: string;
    name: string;
    defaultConfig: PluginConfig;
    ConfigComponent: React.FC;
    ViewComponent: React.FC;
    ResultComponent: React.FC;
    getState: () => PluginState | undefined;
    updateConfig: (configUpdates: Partial<PluginConfig>) => void;
    updateResult: (result: any) => void;
    getAppStore: () => any;
    getPluginStore: () => PluginStoreState;
  }
  
  // Plugin store state interface
  export interface PluginStoreState {
    plugins: Record<string, PluginModule>;
    pluginStates: Record<string, PluginState>;
    activePlugins: string[];
    
    registerPlugin: (pluginId: string, pluginModule: PluginModule) => void;
    unregisterPlugin: (pluginId: string) => void;
    activatePlugin: (pluginId: string) => void;
    deactivatePlugin: (pluginId: string) => void;
    updatePluginConfig: (pluginId: string, configUpdates: Partial<PluginConfig>) => void;
    updatePluginResult: (pluginId: string, result: any) => void;
    getPluginState: (pluginId: string) => PluginState | undefined;
    getActivePlugins: () => Array<{ id: string; plugin: PluginModule }>;
  }
  
  // App store state interface
  export interface AppStoreState {
    counter: number;
    increment: () => void;
    decrement: () => void;
  }