/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/stepsPlugins/registry.ts


import { Step, StepType } from "@/types";
import React from "react";

// Define the common plugin interface
export interface PluginDefinition<TConfig = any, TOptions = any> {
  type: string;
  title: string;
  description: string;
  defaultConfig: TConfig;
  defaultOptions: TOptions;
  renderer?: React.ComponentType<PluginRendererProps>;
}

// Plugin renderer props interface
export interface PluginRendererProps {
  step: Step;
  onComplete: (result?: Record<string, any>) => void;
}

// Plugin registry using a Map
const pluginRegistry = new Map<string, PluginDefinition>();

// Plugin registration function
export function registerPlugin<TConfig = any, TOptions = any>(
  plugin: PluginDefinition<TConfig, TOptions>
) {
  pluginRegistry.set(plugin.type, plugin);
  console.log(`Plugin registered: ${plugin.type}`);
}

// Get plugin definition
export function getPlugin(type: string): PluginDefinition | undefined {
  return pluginRegistry.get(type);
}

// Get all registered plugin types
export function getPluginTypes(): string[] {
  return Array.from(pluginRegistry.keys());
}

// Get all registered plugins
export function getPluginsList(): PluginDefinition[] {
  return Array.from(pluginRegistry.values());
}

// Get default config for a plugin type
export function getPluginDefaultConfig(type: string): Record<string, any> {
  return pluginRegistry.get(type)?.defaultConfig || {};
}

// Get default options for a plugin type
export function getPluginDefaultOptions(type: string): Record<string, any> {
  return pluginRegistry.get(type)?.defaultOptions || {};
}

// Get plugin renderer component
export function getPluginRenderer(type: string): React.ComponentType<PluginRendererProps> | undefined {
  return pluginRegistry.get(type)?.renderer;
}

// Schema cache for plugins
const schemaCache = new Map<string, any>();

// Get plugin schema (for configuration UI)
export function getPluginSchema(type: string): any {
  // Check cache first
  if (schemaCache.has(type)) {
    return schemaCache.get(type);
  }
  
  // Otherwise build a basic schema from the plugin definition
  const plugin = getPlugin(type);
  if (!plugin) return null;
  
  // Create a basic schema from the default config and options
  const schema = {
    type: "object",
    properties: {
      config: {
        type: "object",
        properties: createSchemaProperties(plugin.defaultConfig)
      },
      options: {
        type: "object",
        properties: createSchemaProperties(plugin.defaultOptions)
      }
    }
  };
  
  // Cache the schema
  schemaCache.set(type, schema);
  return schema;
}

// Helper to create schema properties from an object
function createSchemaProperties(obj: Record<string, any>): Record<string, any> {
  const properties: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Determine property type
    let type = typeof value;
    
    if (Array.isArray(value)) {
      type = "object"; // Change "array" to "object"
    }
    
    properties[key] = {
      type,
      default: value
    };
    
    // For objects, recursively create properties
    if (type === "object" && !Array.isArray(value)) {
      properties[key].properties = createSchemaProperties(value);
    }
  }
  
  return properties;
}

// Dynamic plugin loader component - FIX THE PATH HERE
export function loadPluginRenderer(type: StepType): Promise<React.ComponentType<PluginRendererProps>> {
  return new Promise((resolve, reject) => {
    // First check if we already have this plugin registered with a renderer
    const existingPlugin = getPlugin(type);
    if (existingPlugin?.renderer) {
      resolve(existingPlugin.renderer);
      return;
    }

    // FIX: Use the correct path to stepsPlugins instead of plugins
    import(`./${type}/renderer`)
      .then(module => {
        if (module.default) {
          // If the plugin is found, register its renderer
          const plugin = getPlugin(type);
          if (plugin) {
            plugin.renderer = module.default;
            resolve(module.default);
          } else {
            reject(new Error(`Plugin type "${type}" is not registered`));
          }
        } else {
          reject(new Error(`No default export found for plugin type "${type}"`));
        }
      })
      .catch(error => {
        console.error(`Error loading plugin renderer for "${type}":`, error);
        reject(error);
      });
  });
}

// Dynamically load all plugins at startup
export async function initializePlugins() {
  try {
    // FIX: Use the correct path to stepsPlugins instead of plugins
    const pluginModules = import.meta.glob('./*/*/index.ts', { eager: true });
    
    console.log(`Found ${Object.keys(pluginModules).length} plugins to initialize`);
    
    // Then preload renderers for all registered plugins
    const pluginTypes = getPluginTypes();
    for (const type of pluginTypes) {
      try {
        await loadPluginRenderer(type as StepType);
        console.log(`Loaded renderer for plugin: ${type}`);
      } catch (error) {
        console.warn(`Failed to preload renderer for plugin "${type}":`, error);
        // Non-critical error, continue with other plugins
      }
    }
    
    console.log('Plugin system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize plugin system:', error);
    throw error;
  }
}