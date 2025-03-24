// src/modules/plugins/pluginsStore.ts
import { produce } from "immer";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { DynamicComponentStore } from "./types";

// Create a singleton instance that will be globally accessible
const useDynamicComponentStore = create<DynamicComponentStore>()(
  persist(
    (set, get) => ({
      components: {},
      componentData: {},

      registerComponent: (key, component) =>
        set(
          produce((state) => {
            state.components[key] = component;
            if (!state.componentData[key]) {
              state.componentData[key] = null;
            }
            console.log(`Component registered: ${key}`);
          })
        ),

      unregisterComponent: (key) =>
        set(
          produce((state) => {
            delete state.components[key];
            console.log(`Component unregistered: ${key}`);
          })
        ),

      setComponentData: (key, data) =>
        set(
          produce((state) => {
            state.componentData[key] = data;
          })
        ),

      getComponentData: (key) => {
        const { componentData } = get();
        return componentData[key] || null;
      },

      getComponentKeys: () => {
        const { components } = get();
        return Object.keys(components);
      },

      getComponent: (key) => {
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