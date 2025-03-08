/* eslint-disable @typescript-eslint/no-unused-vars */
// src/plugins/store/pluginStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PluginRegistration } from '../types';


interface PluginState {
  installedPlugins: Record<string, { 
    id: string;
    version: string;
    enabled: boolean;
    path: string;
  }>;
  registeredPlugins: Record<string, PluginRegistration>;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  installPlugin: (pluginId: string, version: string, path: string) => void;
  uninstallPlugin: (pluginId: string) => void;
  enablePlugin: (pluginId: string) => void;
  disablePlugin: (pluginId: string) => void;
  registerPlugin: (plugin: PluginRegistration) => void;
  unregisterPlugin: (pluginId: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePluginStore = create<PluginState>()(
  persist(
    (set, get) => ({
      installedPlugins: {},
      registeredPlugins: {},
      isLoading: false,
      error: null,
      
      installPlugin: (pluginId, version, path) => {
        set((state) => ({ 
          installedPlugins: { 
            ...state.installedPlugins,
            [pluginId]: { id: pluginId, version, enabled: true, path } 
          }
        }));
      },
      
      uninstallPlugin: (pluginId) => {
        set((state) => {
          const { [pluginId]: _, ...remaining } = state.installedPlugins;
          return { installedPlugins: remaining };
        });
        
        // Również wyrejestruj, jeśli jest aktualnie zarejestrowany
        if (get().registeredPlugins[pluginId]) {
          get().unregisterPlugin(pluginId);
        }
      },
      
      enablePlugin: (pluginId) => {
        set((state) => {
          if (!state.installedPlugins[pluginId]) return state;
          
          return {
            installedPlugins: {
              ...state.installedPlugins,
              [pluginId]: {
                ...state.installedPlugins[pluginId],
                enabled: true
              }
            }
          };
        });
      },
      
      disablePlugin: (pluginId) => {
        // NAPRAWIONO: Usunięto wywołanie unregisterPlugin z warunku, aby uniknąć nieskończonej pętli
        set((state) => {
          if (!state.installedPlugins[pluginId]) return state;
          
          return {
            installedPlugins: {
              ...state.installedPlugins,
              [pluginId]: {
                ...state.installedPlugins[pluginId],
                enabled: false
              }
            }
          };
        });
        
        // Oddzielnie: wyrejestruj wtyczkę
        const { registeredPlugins } = get();
        if (registeredPlugins[pluginId]) {
          get().unregisterPlugin(pluginId);
        }
      },
      
      registerPlugin: (plugin) => {
        set((state) => ({
          registeredPlugins: {
            ...state.registeredPlugins,
            [plugin.id]: plugin
          }
        }));
      },
      
      unregisterPlugin: (pluginId) => {
        set((state) => {
          const { [pluginId]: _, ...remaining } = state.registeredPlugins;
          return { registeredPlugins: remaining };
        });
      },
      
      setLoading: (isLoading) => {
        set({ isLoading });
      },
      
      setError: (error) => {
        set({ error });
      }
    }),
    {
      name: 'app-plugins-storage',
      partialize: (state) => ({ 
        installedPlugins: state.installedPlugins
        // Przechowuj tylko installedPlugins, nie te zarejestrowane w czasie wykonania
      }),
    }
  )
);

// Funkcja eksponująca sklep dla wtyczek
export function getPluginStore() {
  return usePluginStore.getState();
}

// Stwórz typowany hook dla wtyczek korzystających ze sklepu
export function createPluginStoreHook<T>(selector: (state: PluginState) => T) {
  return () => usePluginStore(selector);
}