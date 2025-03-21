// src/modules/plugins/pluginsStore.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { produce } from 'immer';
import { create } from 'zustand';
import { ComponentType } from 'react';

// Define types
type ComponentData = any;

interface DynamicComponentStore {
  components: Record<string, ComponentType<any>>;
  componentData: Record<string, ComponentData>;
  registerComponent: (key: string, component: ComponentType<any>) => void;
  unregisterComponent: (key: string) => void;
  setComponentData: (key: string, data: ComponentData) => void;
  getComponentData: (key: string) => ComponentData;
  getComponentKeys: () => string[];
  getComponent: (key: string) => ComponentType<any> | null;
}

// Create a singleton instance that will be globally accessible
const useDynamicComponentStore = create<DynamicComponentStore>((set, get) => ({
  components: {},
  componentData: {},

  registerComponent: (key: string, component: ComponentType<any>) => 
    set(produce((state) => {
      state.components[key] = component;
      if (!state.componentData[key]) {
        state.componentData[key] = null;
      }
      console.log(`Component registered: ${key}`);
    })),

  unregisterComponent: (key: string) => 
    set(produce((state) => {
      delete state.components[key];
      console.log(`Component unregistered: ${key}`);
    })),

  setComponentData: (key: string, data: ComponentData) => 
    set(produce((state) => {
      state.componentData[key] = data;
    })),

  getComponentData: (key: string) => {
    const { componentData } = get();
    return componentData[key] || null;
  },

  getComponentKeys: () => {
    const { components } = get();
    return Object.keys(components);
  },

  getComponent: (key: string) => {
    const { components } = get();
    return components[key] || null;
  }
}));

// Export a global function for registering components from anywhere
export const registerDynamicComponent = (key: string, component: ComponentType<any>) => {
  useDynamicComponentStore.getState().registerComponent(key, component);
};

// Helper for unregistering
export const unregisterDynamicComponent = (key: string) => {
  useDynamicComponentStore.getState().unregisterComponent(key);
};

export default useDynamicComponentStore;