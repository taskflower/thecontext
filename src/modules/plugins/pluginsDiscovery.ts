// src/modules/plugins/pluginsDiscovery.ts
import { ComponentType } from 'react';
import { PluginRegistry } from './pluginContext';
import { PluginComponentProps } from './types';

// Define the interface for the module
interface ComponentModule {
  default: ComponentType<PluginComponentProps>;
}

export async function discoverAndLoadComponents() {
  try {
    // Use one consistent path to components
    const componentModules = import.meta.glob('../../dynamicComponents/*.tsx');
    
    // Track loaded plugins
    const loadedPlugins: string[] = [];
    
    for (const path in componentModules) {
      try {
        const module = await componentModules[path]() as ComponentModule;
        const componentName = path.split('/').pop()?.replace('.tsx', '') || '';
        
        if (module.default) {
          PluginRegistry.register(componentName, module.default);
          loadedPlugins.push(componentName);
          console.log(`Auto-discovered and registered: ${componentName} from ${path}`);
        }
      } catch (moduleError) {
        console.error(`Error loading module from ${path}:`, moduleError);
      }
    }
    
    return loadedPlugins;
  } catch (error) {
    console.error("Error during component discovery:", error);
    return [];
  }
}

// Function to load a single plugin dynamically
export async function loadPlugin(path: string): Promise<string | null> {
  try {
    const module = await import(/* @vite-ignore */ path) as ComponentModule;
    const componentName = path.split('/').pop()?.replace(/\.(tsx|jsx|ts|js)$/, '') || '';
    
    if (module.default) {
      PluginRegistry.register(componentName, module.default);
      console.log(`Dynamically loaded and registered: ${componentName}`);
      return componentName;
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load plugin from ${path}:`, error);
    return null;
  }
}