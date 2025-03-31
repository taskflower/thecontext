/**
 * Plugin component store
 * Manages registration and data for dynamically loaded plugin components
 */
import { produce } from "immer";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ComponentType } from "react";
import { DynamicComponentStore, PluginComponentProps } from "./types";

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

      /**
       * Registers a component with the store
       * @param key Unique identifier for the component
       * @param component The React component to register
       */
      registerComponent: (key: string, component: ComponentType<PluginComponentProps>) =>
        set(
          produce((state) => {
            state.components[key] = component;
            // Initialize component data if not already present
            if (!state.componentData[key]) {
              state.componentData[key] = null;
            }
            console.log(`Component registered: ${key}`);
          })
        ),

      /**
       * Unregisters a component from the store
       * @param key Unique identifier of the component to unregister
       */
      unregisterComponent: (key: string) =>
        set(
          produce((state) => {
            delete state.components[key];
            console.log(`Component unregistered: ${key}`);
          })
        ),

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
    }),
    {
      name: "plugin-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist the componentData, not the actual components
        // since functions can't be serialized to JSON
        componentData: state.componentData,
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