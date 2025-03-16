// Podstawowe interfejsy dla systemu pluginów

// Konfiguracja pluginu
export interface PluginConfig {
    id: string;
    name: string;
    description: string;
    version: string;
  }
  
  // Wyniki wykonania pluginu
  export interface PluginResult {
    input: string;
    output: string;
    executionTime: number;
    success: boolean;
    error?: string;
  }
  
  // Główny interfejs pluginu
  export interface Plugin {
    config: PluginConfig;
    process: (input: string) => Promise<string>;
    isActive?: boolean;
  }
  
  // Stan pluginu w store
  export interface PluginState {
    active: boolean;
    lastResult?: PluginResult;
    lastExecuted?: number;
  }