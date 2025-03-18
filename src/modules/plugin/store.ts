/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/store.ts
import { create } from 'zustand';

interface PluginStore {
  // Stan
  plugins: Record<string, Plugin>;
  activePlugins: string[];
  pluginOptions: Record<string, Record<string, any>>;
  
  // Akcje
  registerPlugin: (plugin: Plugin) => void;
  togglePlugin: (pluginId: string, active: boolean) => void;
  setPluginOptions: (pluginId: string, options: Record<string, any>) => void;
  getActivePlugins: () => Plugin[];
}

export const usePluginStore = create<PluginStore>((set, get) => ({
  plugins: {},
  activePlugins: [],
  pluginOptions: {},
  
  registerPlugin: (plugin) => set((state) => ({
    plugins: { ...state.plugins, [plugin.id]: plugin }
  })),
  
  togglePlugin: (pluginId, active) => set((state) => ({
    activePlugins: active 
      ? [...state.activePlugins, pluginId]
      : state.activePlugins.filter(id => id !== pluginId)
  })),
  
  setPluginOptions: (pluginId, options) => set((state) => ({
    pluginOptions: { 
      ...state.pluginOptions, 
      [pluginId]: options 
    }
  })),
  
  getActivePlugins: () => {
    const { plugins, activePlugins } = get();
    return activePlugins
      .map(id => plugins[id])
      .filter(Boolean);
  }
}));