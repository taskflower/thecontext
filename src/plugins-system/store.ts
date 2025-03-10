// src/plugin-system/store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppStoreState, PluginStoreState, PluginState } from './types';

// Main application store
export const useAppStore = create<AppStoreState>((set) => ({
  counter: 0,
  increment: () => set(state => ({ counter: state.counter + 1 })),
  decrement: () => set(state => ({ counter: state.counter - 1 })),
}));

// Plugin system store
export const usePluginStore = create<PluginStoreState>()(
  persist(
    (set, get) => ({
      plugins: {},
      pluginStates: {},
      activePlugins: [],
      
      // Register a new plugin
      registerPlugin: (pluginId, pluginModule) => {
        if (get().plugins[pluginId]) {
          console.warn(`Plugin ${pluginId} already registered`);
          return;
        }
        
        // Initialize plugin state with default config
        const initialState: PluginState = {
          config: pluginModule.defaultConfig || {},
          result: null,
        };
        
        set(state => ({
          plugins: {
            ...state.plugins,
            [pluginId]: pluginModule
          },
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: initialState
          }
        }));
      },
      
      // Unregister (remove) a plugin
      unregisterPlugin: (pluginId) => {
        const { plugins, pluginStates, activePlugins } = get();
        
        // Create new objects without the specified plugin
        const newPlugins = { ...plugins };
        const newPluginStates = { ...pluginStates };
        delete newPlugins[pluginId];
        delete newPluginStates[pluginId];
        
        set({
          plugins: newPlugins,
          pluginStates: newPluginStates,
          activePlugins: activePlugins.filter(id => id !== pluginId)
        });
      },
      
      // Activate a plugin
      activatePlugin: (pluginId) => {
        const { plugins, activePlugins } = get();
        
        if (!plugins[pluginId]) {
          console.error(`Cannot activate non-existent plugin: ${pluginId}`);
          return;
        }
        
        if (!activePlugins.includes(pluginId)) {
          set(state => ({
            activePlugins: [...state.activePlugins, pluginId]
          }));
        }
      },
      
      // Deactivate a plugin
      deactivatePlugin: (pluginId) => {
        set(state => ({
          activePlugins: state.activePlugins.filter(id => id !== pluginId)
        }));
      },
      
      // Update plugin configuration
      updatePluginConfig: (pluginId, configUpdates) => {
        const { pluginStates } = get();
        
        if (!pluginStates[pluginId]) {
          console.error(`Cannot update config for non-existent plugin: ${pluginId}`);
          return;
        }
        
        set(state => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              config: {
                ...state.pluginStates[pluginId].config,
                ...configUpdates
              }
            }
          }
        }));
      },
      
      // Update plugin result
      updatePluginResult: (pluginId, result) => {
        const { pluginStates } = get();
        
        if (!pluginStates[pluginId]) {
          console.error(`Cannot update result for non-existent plugin: ${pluginId}`);
          return;
        }
        
        set(state => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              result
            }
          }
        }));
      },
      
      // Get plugin state
      getPluginState: (pluginId) => {
        return get().pluginStates[pluginId];
      },
      
      // Get all active plugins
      getActivePlugins: () => {
        const { plugins, activePlugins } = get();
        return activePlugins.map(id => ({
          id,
          plugin: plugins[id]
        }));
      }
    }),
    {
      name: 'plugin-storage',
      partialize: (state) => ({
        pluginStates: state.pluginStates,
        activePlugins: state.activePlugins
      })
    }
  )
);
