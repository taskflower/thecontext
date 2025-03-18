/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/types.ts
export interface PluginOption {
  id: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'select';
  default?: any;
  options?: Array<{ value: string; label: string }>;
}

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  options?: PluginOption[]; // Uproszczona schema opcji
  
  // Kluczowa funkcjonalność
  process: (text: string, options?: Record<string, any>) => Promise<string>;
}