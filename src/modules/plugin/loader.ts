/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/loader.ts
import { usePluginStore } from "./store";
import { Plugin } from "./types";

/**
 * Loads plugins from the filesystem
 * Uses Vite's import.meta.glob to dynamically load plugin modules
 */
export const loadPlugins = async (): Promise<void> => {
  const store = usePluginStore.getState();
  
  try {
    // Dynamically import all plugins
    const pluginModules = import.meta.glob("./../../plugins/*/index.tsx", {
      eager: true,
    });

    console.log(`Discovered ${Object.keys(pluginModules).length} plugin modules`);

    Object.entries(pluginModules).forEach(([path, module]) => {
      const mod = module as any;
      
      // Check for modern plugin format
      if (mod.default?.id && typeof mod.default.process === 'function') {
        const plugin = mod.default as Plugin;
        console.log(`Registering plugin: ${plugin.name} (${plugin.id})`);
        store.registerPlugin(plugin);
      } 
      // Legacy plugin format support
      else if (mod.default?.config?.id && typeof mod.default.process === 'function') {
        const legacy = mod.default;
        const plugin: Plugin = {
          id: legacy.config.id,
          name: legacy.config.name,
          description: legacy.config.description,
          version: legacy.config.version,
          options: legacy.config.optionsSchema,
          process: legacy.process,
          // Map any other legacy fields
          ...(legacy.overrideComponents && { overrideComponents: legacy.overrideComponents }),
          ...(legacy.processUserInput && { processUserInput: legacy.processUserInput })
        };
        
        console.log(`Registering legacy plugin: ${plugin.name} (${plugin.id})`);
        store.registerPlugin(plugin);
      } 
      else {
        console.warn(`Invalid plugin module found at ${path}`);
      }
    });

    console.log(`Successfully loaded ${Object.keys(store.plugins).length} plugins`);
  } catch (error) {
    console.error("Error loading plugins:", error);
  }
};

/**
 * Check if plugins are loaded
 */
export const arePluginsLoaded = (): boolean => {
  const store = usePluginStore.getState();
  return Object.keys(store.plugins).length > 0;
};

/**
 * Ensure plugins are loaded
 */
export const ensurePluginsLoaded = async (): Promise<void> => {
  if (!arePluginsLoaded()) {
    await loadPlugins();
  }
};