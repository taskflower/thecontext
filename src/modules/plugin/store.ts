/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/store.ts
import { create } from 'zustand';
import { Plugin } from './types';
import { devtools, persist } from 'zustand/middleware';

interface PluginState {
  // State
  plugins: Record<string, Plugin>;
  activePlugins: string[];
  pluginOptions: Record<string, Record<string, any>>;
}

interface PluginActions {
  // Actions
  registerPlugin: (plugin: Plugin) => void;
  togglePlugin: (pluginId: string, active: boolean) => void;
  setPluginOptions: (pluginId: string, options: Record<string, any>) => void;
  getActivePlugins: () => Plugin[];
  resetPlugins: () => void;
}

type PluginStore = PluginState & PluginActions;

export const usePluginStore = create<PluginStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        plugins: {},
        activePlugins: [],
        pluginOptions: {},
        
        // Actions
        registerPlugin: (plugin) => 
          set((state) => ({
            plugins: { ...state.plugins, [plugin.id]: plugin }
          })),
        
        togglePlugin: (pluginId, active) => 
          set((state) => ({
            activePlugins: active 
              ? [...state.activePlugins, pluginId]
              : state.activePlugins.filter(id => id !== pluginId)
          })),
        
        setPluginOptions: (pluginId, options) => 
          set((state) => ({
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
        },
        
        resetPlugins: () => 
          set((state) => ({
            activePlugins: [],
            pluginOptions: Object.keys(state.plugins).reduce((acc, id) => {
              acc[id] = {};
              return acc;
            }, {} as Record<string, Record<string, any>>)
          }))
      }),
      {
        name: 'flow-plugin-storage',
        partialize: (state) => ({
          activePlugins: state.activePlugins,
          pluginOptions: state.pluginOptions,
        }),
      }
    )
  )
);