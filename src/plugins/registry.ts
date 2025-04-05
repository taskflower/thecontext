/**
 * Plugin registry and management
 */
import { PluginRegistration, PluginRegistry } from './types';

// Plugin registry - stores all registered plugins
let pluginRegistry: PluginRegistry = {};

/**
 * Register a new plugin
 */
export const registerPlugin = (plugin: PluginRegistration): void => {
  if (pluginRegistry[plugin.manifest.id]) {
    console.warn(`Plugin with id ${plugin.manifest.id} already exists. Overwriting.`);
  }
  
  // Validate plugin
  if (!validatePlugin(plugin)) {
    console.error(`Plugin ${plugin.manifest.id} failed validation and was not registered.`);
    return;
  }
  
  // Register plugin
  pluginRegistry[plugin.manifest.id] = plugin;
  
  console.log(`Plugin ${plugin.manifest.id} registered successfully.`);
};

/**
 * Unregister a plugin
 */
export const unregisterPlugin = (pluginId: string): void => {
  if (!pluginRegistry[pluginId]) {
    console.warn(`Plugin with id ${pluginId} does not exist.`);
    return;
  }
  
  delete pluginRegistry[pluginId];
  console.log(`Plugin ${pluginId} unregistered.`);
};

/**
 * Get a plugin by ID
 */
export const getPlugin = (pluginId: string): PluginRegistration | undefined => {
  return pluginRegistry[pluginId];
};

/**
 * Get all registered plugins
 */
export const getAllPlugins = (): PluginRegistration[] => {
  return Object.values(pluginRegistry);
};

/**
 * Get all plugins of a specific type
 */
export const getPluginsByType = (type: string): PluginRegistration[] => {
  return Object.values(pluginRegistry).filter(
    (plugin) => plugin.manifest.type === type
  );
};

/**
 * Get plugins that support a specific hook point
 */
export const getPluginsByHookPoint = (hookPoint: string): PluginRegistration[] => {
  return Object.values(pluginRegistry).filter(
    (plugin) => plugin.manifest.hookPoints?.includes(hookPoint)
  );
};

/**
 * Validate plugin format
 */
const validatePlugin = (plugin: PluginRegistration): boolean => {
  // Check required fields
  if (!plugin.manifest || !plugin.manifest.id || !plugin.manifest.type) {
    console.error('Plugin missing required fields (id, type)');
    return false;
  }
  
  // Check components
  if (!plugin.components || Object.keys(plugin.components).length === 0) {
    console.warn(`Plugin ${plugin.manifest.id} has no components.`);
  }
  
  // Additional validations can be added here
  
  return true;
};

/**
 * Reset plugin registry (for testing)
 */
export const resetPluginRegistry = (): void => {
  pluginRegistry = {};
};

export default {
  registerPlugin,
  unregisterPlugin,
  getPlugin,
  getAllPlugins,
  getPluginsByType,
  getPluginsByHookPoint,
  resetPluginRegistry
};