/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/dynamicComponentLoader.ts
import { ComponentType } from 'react';
import { registerDynamicComponent } from "./dynamicComponentStore";

// Define the interface for the module
interface ComponentModule {
  default: ComponentType<any>;
}

// Define a type for the window with our custom properties
declare global {
  interface Window {
    __DYNAMIC_COMPONENTS__: {
      registry: any;
      register: (key: string, component: React.ComponentType<any>) => void;
      unregister: (key: string) => void;
    };
  }
}

/**
 * This function allows dynamically loading and registering components at runtime
 * It can be called from anywhere in the application or even from external scripts
 */
export const loadDynamicComponent = async (
  key: string,
  componentPath: string
): Promise<void> => {
  try {
    // Dynamically import the component
    const module = await import(/* @vite-ignore */ componentPath) as ComponentModule;
    
    // Get the default export which should be the component
    const Component = module.default;
    
    if (!Component) {
      console.error(`Component at ${componentPath} does not have a default export`);
      return;
    }
    
    // Register the component in our store
    registerDynamicComponent(key, Component);
    console.log(`Successfully loaded and registered component: ${key}`);
  } catch (error) {
    console.error(`Failed to load component from ${componentPath}:`, error);
  }
};

// Example usage:
// loadDynamicComponent('MyDynamicComponent', './components/MyDynamicComponent.js');