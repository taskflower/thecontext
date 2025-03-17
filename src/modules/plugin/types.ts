// src/modules/plugin/types.ts
export interface PluginConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  optionsSchema?: PluginOption[]; // Schema for plugin options
}

export interface PluginOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  default?: string | number | boolean;
  options?: Array<{ value: string; label: string }>; // For select type
}

export interface PluginOptions {
  [key: string]: string | number | boolean;
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
  process: (input: string, options?: PluginOptions) => Promise<string>;
  renderOptionsUI?: (options: PluginOptions, onChange: (newOptions: PluginOptions) => void) => React.ReactNode;
  isActive?: boolean;
}

export interface PluginState {
  active: boolean;
  lastResult?: PluginResult;
  lastExecuted?: number;
}