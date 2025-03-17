export interface PluginConfig {
    id: string;
    name: string;
    description: string;
    version: string;
  }
  
  export interface PluginResult {
    input: string;
    output: string;
    executionTime: number;
    success: boolean;
    error?: string;
  }
  
  export interface Plugin {
    config: PluginConfig;
    process: (input: string) => Promise<string>;
    isActive?: boolean;
  }
  
  export interface PluginState {
    active: boolean;
    lastResult?: PluginResult;
    lastExecuted?: number;
  }