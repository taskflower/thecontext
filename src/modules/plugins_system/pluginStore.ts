/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugins_system/pluginStore.ts
// Uproszczony magazyn pluginów

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PluginModule } from './PluginInterface';
import { useScenarioStore } from '../scenarios_module/scenarioStore';

interface PluginState {
  config: Record<string, any>;
  result: any;
}

interface PluginStore {
  // Stan
  plugins: Record<string, PluginModule>;
  pluginStates: Record<string, PluginState>;
  activePlugins: string[];
  
  // Zarządzanie pluginami
  registerPlugin: (pluginId: string, pluginModule: PluginModule) => void;
  unregisterPlugin: (pluginId: string) => void;
  activatePlugin: (pluginId: string) => void;
  deactivatePlugin: (pluginId: string) => void;
  
  // Zarządzanie stanem pluginów
  getPluginState: (pluginId: string) => PluginState | undefined;
  updatePluginConfig: (pluginId: string, configUpdates: Record<string, any>) => void;
  updatePluginResult: (pluginId: string, result: any) => void;
  
  // Funkcje pomocnicze
  getActivePlugins: () => Array<{ id: string; plugin: PluginModule }>;
}

export const usePluginStore = create<PluginStore>()(
  persist(
    (set, get) => ({
      plugins: {},
      pluginStates: {},
      activePlugins: [],
      
      registerPlugin: (pluginId, pluginModule) => {
        const initialState: PluginState = {
          config: pluginModule.defaultConfig || {},
          result: null
        };
        
        set(state => ({
          plugins: { ...state.plugins, [pluginId]: pluginModule },
          pluginStates: { ...state.pluginStates, [pluginId]: initialState }
        }));
      },
      
      unregisterPlugin: (pluginId) => {
        // Usuń plugin z węzłów, które go używają
        const scenarioStore = useScenarioStore.getState();
        Object.entries(scenarioStore.nodes)
          .filter(([_, node]) => node.pluginId === pluginId)
          .forEach(([nodeId]) => {
            scenarioStore.removePluginFromNode(nodeId);
          });
        
        // Usuń plugin ze store'a
        set(state => {
          const newPlugins = { ...state.plugins };
          const newStates = { ...state.pluginStates };
          delete newPlugins[pluginId];
          delete newStates[pluginId];
          
          return {
            plugins: newPlugins,
            pluginStates: newStates,
            activePlugins: state.activePlugins.filter(id => id !== pluginId)
          };
        });
      },
      
      activatePlugin: (pluginId) => {
        if (!get().plugins[pluginId]) return;
        
        set(state => ({
          activePlugins: state.activePlugins.includes(pluginId)
            ? state.activePlugins
            : [...state.activePlugins, pluginId]
        }));
      },
      
      deactivatePlugin: (pluginId) => {
        set(state => ({
          activePlugins: state.activePlugins.filter(id => id !== pluginId)
        }));
      },
      
      getPluginState: (pluginId) => {
        return get().pluginStates[pluginId];
      },
      
      updatePluginConfig: (pluginId, configUpdates) => {
        if (!get().pluginStates[pluginId]) return;
        
        set(state => ({
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