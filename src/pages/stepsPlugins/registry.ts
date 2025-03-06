// src/pages/stepsPlugins/registry.ts
import { StepPlugin } from './types';
// Import from new validation system
import { validateStep } from '@/services/validation';

// Plugin categories
export const PLUGIN_CATEGORIES = {
  CONTENT: "Tworzenie Treści",
  APPROVAL: "Zatwierdzanie i Recenzje",
  DATA: "Zbieranie Danych",
  INTEGRATION: "Integracje"
};

// Plugin registry
const plugins = new Map<string, StepPlugin>();

/**
 * Registers a plugin in the system
 */
export function register(plugin: StepPlugin): void {
  plugins.set(plugin.type, plugin);
  console.log(`Zarejestrowano plugin: ${plugin.type} (${plugin.name})`);
}

/**
 * Gets a plugin by its type
 */
export function getPlugin(type: string): StepPlugin | undefined {
  return plugins.get(type);
}

/**
 * Gets all registered plugins
 */
export function getAllPlugins(): StepPlugin[] {
  return Array.from(plugins.values());
}

/**
 * Gets plugins by category
 */
export function getPluginsByCategory(category: string): StepPlugin[] {
  return getAllPlugins().filter(plugin => plugin.category === category);
}

/**
 * Gets default configuration for a plugin
 */
export function getDefaultConfig(type: string): Record<string, any> {
  return plugins.get(type)?.defaultConfig || {};
}

/**
 * Creates a new step of the specified type with default values
 */
export function createDefaultStep(type: string, taskId: string, order: number): Partial<any> {
  const plugin = getPlugin(type);
  if (!plugin) return {};
  
  return {
    type,
    taskId,
    order,
    title: plugin.name,
    description: plugin.description,
    config: { ...plugin.defaultConfig },
    status: 'pending',
    options: {},
    result: null
  };
}

// Export validation function from new system
export { validateStep };