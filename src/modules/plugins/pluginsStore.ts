/**
 * Plugin component store
 * Manages registration and data for dynamically loaded plugin components
 */
import { produce } from "immer";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ComponentType } from "react";
import { DynamicComponentStore, PluginComponentProps, PluginType } from "./types";

/**
 * Creates a singleton store instance for managing dynamic plugin components
 * - Handles component registration/unregistration
 * - Stores and retrieves component data
 * - Persists component data to localStorage
 */
const useDynamicComponentStore = create<DynamicComponentStore>()(
  persist(
    (set, get) => ({
      // State properties
      components: {},
      componentData: {},
      pluginTypes: {} as Record<string, PluginType>,

      /**
       * Registers a component with the store
       * @param key Unique identifier for the component
       * @param component The React component to register
       * @param type Optional plugin type, defaults to 'flow'
       */
      registerComponent: (
        key: string, 
        component: ComponentType<PluginComponentProps>,
        type: PluginType = 'flow'
      ) => {
        // Check if component is already registered with same type
        const state = get();
        if (state.components[key] && state.pluginTypes[key] === type) {
          console.log(`Component already registered: ${key} (type: ${type})`);
          return; // Skip if already registered with same type
        }
        
        set(
          produce((state) => {
            // Register the component
            state.components[key] = component;
            
            // Initialize component data if not already present
            if (!state.componentData[key]) {
              state.componentData[key] = null;
            }
            
            // Set plugin type
            state.pluginTypes[key] = type;
            
            console.log(`Component registered: ${key} (type: ${type})`);
          })
        );
      },

      /**
       * Unregisters a component from the store
       * @param key Unique identifier of the component to unregister
       */
      unregisterComponent: (key: string) => {
        // Check if component exists before trying to unregister
        const state = get();
        if (!state.components[key]) {
          console.log(`Component not found for unregistration: ${key}`);
          return;
        }
        
        set(
          produce((state) => {
            // Remove component
            delete state.components[key];
            
            // Remove plugin type
            delete state.pluginTypes[key];
            
            // Don't remove the data to allow persistence between sessions
            // If needed, the data can be explicitly cleared with setComponentData(key, null)
            
            console.log(`Component unregistered: ${key}`);
          })
        );
      },

      /**
       * Sets data for a specific component
       * @param key Component identifier
       * @param data Data to associate with the component
       */
      setComponentData: (key: string, data: unknown) =>
        set(
          produce((state) => {
            state.componentData[key] = data;
          })
        ),

      /**
       * Gets data for a specific component
       * @param key Component identifier
       * @returns The component data or null if not found
       */
      getComponentData: (key: string): unknown => {
        const { componentData } = get();
        return componentData[key] || null;
      },

      /**
       * Gets all registered component keys
       * @returns Array of component keys
       */
      getComponentKeys: (): string[] => {
        const { components } = get();
        return Object.keys(components);
      },

      /**
       * Gets a component by key
       * @param key Component identifier
       * @returns The component or null if not found
       */
      getComponent: (key: string): ComponentType<PluginComponentProps> | null => {
        const { components } = get();
        return components[key] || null;
      },
      
      /**
       * Gets component keys by type
       * @param type Plugin type to filter by
       * @returns Array of component keys matching the specified type
       */
      getComponentKeysByType: (type: PluginType): string[] => {
        const { pluginTypes, components } = get();
        
        // Filter by plugin type and ensure component still exists
        return Object.entries(pluginTypes)
          .filter(([key, pluginType]) => 
            pluginType === type && 
            components[key] !== undefined
          )
          .map(([key]) => key);
      },
      
      /**
       * Gets the type of a plugin
       * @param key Plugin identifier
       * @returns The plugin type or undefined if not found
       */
      getPluginType: (key: string): PluginType | undefined => {
        const { pluginTypes } = get();
        return pluginTypes[key];
      },
      
      /**
       * Sets the type of a plugin
       * @param key Plugin identifier
       * @param type Plugin type
       */
      setPluginType: (key: string, type: PluginType) => 
        set(
          produce((state) => {
            state.pluginTypes[key] = type;
          })
        ),
    }),
    {
      name: "plugin-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the componentData and pluginTypes, not the actual components
        // since functions can't be serialized to JSON
        componentData: state.componentData,
        pluginTypes: state.pluginTypes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log("Plugin store hydrated successfully");
        } else {
          console.error("Failed to hydrate plugin store");
        }
      },
    }
  )
);

export default useDynamicComponentStore;