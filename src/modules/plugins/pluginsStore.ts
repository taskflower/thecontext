// src/modules/plugins/pluginsStore.ts

import { produce } from 'immer';
import { create } from 'zustand';
import { 
  DynamicComponentStore, 
  PluginComponentProps 
} from './types';

// Create a singleton instance that will be globally accessible
const useDynamicComponentStore = create<DynamicComponentStore>((set, get) => ({
  components: {},
  componentData: {},

  registerComponent: (key, component) => 
    set(produce((state) => {
      state.components[key] = component;
      if (!state.componentData[key]) {
        state.componentData[key] = null;
      }
      console.log(`Component registered: ${key}`);
    })),

  unregisterComponent: (key) => 
    set(produce((state) => {
      delete state.components[key];
      console.log(`Component unregistered: ${key}`);
    })),

  setComponentData: (key, data) => 
    set(produce((state) => {
      state.componentData[key] = data;
    })),

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
  }
}));

// Export a global function for registering components from anywhere
export const registerDynamicComponent = (
  key: string, 
  component: React.ComponentType<PluginComponentProps>
) => {
  useDynamicComponentStore.getState().registerComponent(key, component);
};

// Helper for unregistering
export const unregisterDynamicComponent = (key: string) => {
  useDynamicComponentStore.getState().unregisterComponent(key);
};

export default useDynamicComponentStore;