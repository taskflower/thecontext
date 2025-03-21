// src/modules/plugins/pluginsDiscovery.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentType } from 'react';

// Define the interface for the module
interface ComponentModule {
  default: ComponentType<any>;
}


export async function discoverAndLoadComponents() {
  try {
    // Używamy jednej, spójnej ścieżki do komponentów
    const componentModules = import.meta.glob('../../dynamicComponents/*.tsx');
    
    for (const path in componentModules) {
      const module = await componentModules[path]() as ComponentModule;
      const componentName = path.split('/').pop()?.replace('.tsx', '') || '';
      
      if (window.__DYNAMIC_COMPONENTS__ && module.default) {
        window.__DYNAMIC_COMPONENTS__.register(componentName, module.default);
        console.log(`Auto-discovered and registered: ${componentName} from ${path}`);
      }
    }
  } catch (error) {
    console.error("Error during component discovery:", error);
  }
}