/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/registry.ts
import { StepPlugin } from './types';

// Add plugin categories
export const PLUGIN_CATEGORIES = {
  CONTENT: "Content Creation",
  APPROVAL: "Approval & Review",
  DATA: "Data Collection"
};

// Simple plugin registry
const plugins = new Map<string, StepPlugin>();

export function register(plugin: StepPlugin): void {
  plugins.set(plugin.type, plugin);
  console.log(`Plugin registered: ${plugin.type}`);
}

export function getPlugin(type: string): StepPlugin | undefined {
  return plugins.get(type);
}

export function getAllPlugins(): StepPlugin[] {
  return Array.from(plugins.values());
}

export function getDefaultConfig(type: string): Record<string, any> {
  return plugins.get(type)?.defaultConfig || {};
}