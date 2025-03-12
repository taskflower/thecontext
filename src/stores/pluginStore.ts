/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/stores/pluginStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useNodeStore } from './nodeStore';
import { PluginModule } from '@/plugins/PluginInterface';

interface PluginState {
  config: Record<string, any>;
  result: any;
  isActive: boolean;
}

interface PluginStoreState {
  plugins: Record<string, PluginModule>;
  pluginStates: Record<string, PluginState>;
}

interface PluginStoreActions {
  // Plugin registration
  registerPlugin: (pluginId: string, pluginModule: PluginModule) => void;
  unregisterPlugin: (pluginId: string) => void;
  
  // Plugin activation
  activatePlugin: (pluginId: string) => void;
  deactivatePlugin: (pluginId: string) => void;
  isPluginActive: (pluginId: string) => boolean;
  
  // Plugin state management
  getPluginState: (pluginId: string) => PluginState | undefined;
  updatePluginConfig: (pluginId: string, configUpdates: Record<string, any>) => void;
  updatePluginResult: (pluginId: string, result: any) => void;
  
  // Plugin discovery
  getAllPlugins: () => Array<PluginModule>;
  getActivePlugins: () => Array<PluginModule>;
  
  // Plugin processing
  processNodeWithPlugin: (nodeId: string, input?: string) => Promise<{ output: string; result: any }>;
}

export const usePluginStore = create<PluginStoreState & PluginStoreActions>()(
  persist(
    (set, get) => ({
      plugins: {},
      pluginStates: {},
      
      // Plugin registration
      registerPlugin: (pluginId, pluginModule) => {
        // Initialize plugin state with default config
        const initialState: PluginState = {
          config: pluginModule.defaultConfig || {},
          result: null,
          isActive: false
        };
        
        set((state) => ({
          plugins: { ...state.plugins, [pluginId]: pluginModule },
          pluginStates: { ...state.pluginStates, [pluginId]: initialState }
        }));
      },
      
      unregisterPlugin: (pluginId) => {
        // First, remove plugin from any nodes using it
        const nodeStore = useNodeStore.getState();
        const nodes = Object.values(nodeStore.nodes);
        
        nodes.forEach(node => {
          if (node.data.pluginId === pluginId) {
            nodeStore.removePluginFromNode(node.id);
          }
        });
        
        // Then remove the plugin itself
        set((state) => {
          const newPlugins = { ...state.plugins };
          const newStates = { ...state.pluginStates };
          
          delete newPlugins[pluginId];
          delete newStates[pluginId];
          
          return {
            plugins: newPlugins,
            pluginStates: newStates
          };
        });
      },
      
      // Plugin activation
      activatePlugin: (pluginId) => {
        if (!get().plugins[pluginId]) return;
        
        set((state) => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              isActive: true
            }
          }
        }));
      },
      
      deactivatePlugin: (pluginId) => {
        if (!get().plugins[pluginId]) return;
        
        set((state) => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              isActive: false
            }
          }
        }));
      },
      
      isPluginActive: (pluginId) => {
        return get().pluginStates[pluginId]?.isActive || false;
      },
      
      // Plugin state management
      getPluginState: (pluginId) => {
        return get().pluginStates[pluginId];
      },
      
      updatePluginConfig: (pluginId, configUpdates) => {
        if (!get().pluginStates[pluginId]) return;
        
        set((state) => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              config: { ...state.pluginStates[pluginId].config, ...configUpdates }
            }
          }
        }));
      },
      
      updatePluginResult: (pluginId, result) => {
        if (!get().pluginStates[pluginId]) return;
        
        set((state) => ({
          pluginStates: {
            ...state.pluginStates,
            [pluginId]: {
              ...state.pluginStates[pluginId],
              result
            }
          }
        }));
      },
      
      // Plugin discovery
      getAllPlugins: () => {
        return Object.values(get().plugins);
      },
      
      getActivePlugins: () => {
        const { plugins, pluginStates } = get();
        
        return Object.entries(plugins)
          .filter(([id]) => pluginStates[id]?.isActive)
          .map(([_, plugin]) => plugin);
      },
      
      // Plugin processing
      processNodeWithPlugin: async (nodeId, input = '') => {
        const nodeStore = useNodeStore.getState();
        const node = nodeStore.getNode(nodeId);
        
        if (!node || !node.data.pluginId) {
          return { output: input, result: null };
        }
        
        const pluginId = node.data.pluginId;
        const plugin = get().plugins[pluginId];
        
        if (!plugin || !get().isPluginActive(pluginId)) {
          return { output: input, result: null };
        }
        
        try {
          // Get plugin state
          const pluginState = get().getPluginState(pluginId);
          const config = node.data.pluginConfig || pluginState?.config || {};
          
          // Process with plugin
          if (plugin.processNode) {
            const result = await plugin.processNode({
              node,
              input,
              config
            });
            
            // Update plugin result
            get().updatePluginResult(pluginId, result.result);
            
            // Update node response
            if (result.output) {
              nodeStore.setNodeResponse(nodeId, result.output);
            }
            
            return result;
          }
        } catch (error) {
          console.error(`Error processing node ${nodeId} with plugin ${pluginId}:`, error);
        }
        
        return { output: input, result: null };
      }
    }),
    {
      name: 'plugin-storage',
      partialize: (state) => ({
        pluginStates: state.pluginStates
      })
    }
  )
);