/* eslint-disable @typescript-eslint/no-explicit-any */
// src/featuresPlugins/dynamicComponentDiscovery.ts
import { ComponentType } from 'react';

// Define the interface for the module
interface ComponentModule {
  default: ComponentType<any>;
}

export async function discoverAndLoadComponents() {
  try {
    // Use import.meta.glob for Vite or require.context for webpack
    // This automatically finds all components in the directory
    const componentModules = import.meta.glob('./../dynamicComponents/*.tsx');
    
    for (const path in componentModules) {
      const module = await componentModules[path]() as ComponentModule;
      const componentName = path.split('/').pop()?.replace('.tsx', '') || '';
      
      if (window.__DYNAMIC_COMPONENTS__ && module.default) {
        window.__DYNAMIC_COMPONENTS__.register(componentName, module.default);
        console.log(`Auto-discovered and registered: ${componentName}`);
      }
    }
  } catch (error) {
    console.error("Error during component discovery:", error);
  }
}