/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/registerPlugins.ts
import { usePluginStore } from '@/stores/pluginStore';
import type { PluginModule } from './PluginInterface';

// This will be auto-populated by Vite's import.meta.glob
const pluginModules = import.meta.glob('./*/index.{ts,tsx}', { eager: true });

export const registerAllPlugins = () => {
  const pluginStore = usePluginStore.getState();
  
  // Dynamically import and register all plugins
  Object.entries(pluginModules).forEach(([path, module]) => {
    try {
      // Get the plugin from the module
      const plugin = (module as any).default as PluginModule;
      
      if (plugin && plugin.id && plugin.name) {

        
        // Register the plugin
        pluginStore.registerPlugin(plugin.id, plugin);
        
        // Optionally activate by default
        if (plugin.activateByDefault) {
          pluginStore.activatePlugin(plugin.id);
        }
      } else {
        console.warn(`Invalid plugin found at ${path}`);
      }
    } catch (error) {
      console.error(`Error loading plugin from ${path}:`, error);
    }
  });
};