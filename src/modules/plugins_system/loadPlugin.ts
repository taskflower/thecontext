// src/modules/plugins_system/loadPlugin.ts
// Uproszczony loader pluginów

import { PluginModule } from './PluginInterface';

// Ładuje wtyczki w trybie deweloperskim
export const loadDevPlugins = async (): Promise<PluginModule[]> => {
  if (!import.meta.env.DEV) return [];
  
  try {
    // Używamy Vite import.meta.glob do załadowania wszystkich pluginów z katalogu plugins
    const pluginModules = import.meta.glob('../../plugins/*/index.tsx', { eager: true });
    
    const loadedPlugins: PluginModule[] = [];
    
    for (const path in pluginModules) {
      const module = pluginModules[path] as { default?: PluginModule };
      
      if (module.default && 'id' in module.default && 'name' in module.default) {
        loadedPlugins.push(module.default as PluginModule);
      } else {
        console.warn(`Moduł ${path} nie jest prawidłowym pluginem`);
      }
    }
    
    return loadedPlugins;
  } catch (error) {
    console.error('Błąd podczas ładowania pluginów:', error);
    return [];
  }
};

// Prosty inicjalizator pluginów - hook React
export const useInitializePlugins = () => {
  const { registerPlugin } = usePluginStore();
  
  useEffect(() => {
    // Automatyczne ładowanie pluginów w trybie deweloperskim
    if (import.meta.env.DEV) {
      loadDevPlugins().then(plugins => {
        plugins.forEach(plugin => {
          registerPlugin(plugin.id, plugin);
        });
      });
    }
  }, [registerPlugin]);
};

// Brakujące importy
import { useEffect } from 'react';
import { usePluginStore } from './pluginStore';