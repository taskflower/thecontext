import { StateCreator } from 'zustand';
import { PluginsState } from './plugin-state';
import { PluginResult } from './types';
import { pluginRegistry } from './plugin-registry';


export interface PluginActions {
  // Aktywacja/deaktywacja pluginów
  activatePlugin: (pluginId: string) => void;
  deactivatePlugin: (pluginId: string) => void;
  
  // Wykonanie pojedynczego pluginu
  executePlugin: (pluginId: string, input: string) => Promise<PluginResult>;
  
  // Dodawanie do kolejki
  queuePlugin: (pluginId: string) => void;
  removeFromQueue: (pluginId: string) => void;
  clearQueue: () => void;
  
  // Wykonanie kolejki
  executeQueue: (initialInput: string) => Promise<PluginResult[]>;
}

export const createPluginActions: StateCreator<
  PluginsState & PluginActions,
  [],
  [],
  PluginActions
> = (set, get) => ({
  // Aktywacja pluginu
  activatePlugin: (pluginId: string) => {
    set((state) => ({
      plugins: {
        ...state.plugins,
        [pluginId]: { 
          ...state.plugins[pluginId] || {},
          active: true 
        }
      }
    }));
  },

  // Deaktywacja pluginu
  deactivatePlugin: (pluginId: string) => {
    set((state) => ({
      plugins: {
        ...state.plugins,
        [pluginId]: { 
          ...state.plugins[pluginId] || {},
          active: false 
        }
      }
    }));
  },

  // Wykonanie pojedynczego pluginu
  executePlugin: async (pluginId: string, input: string) => {
    const plugin = pluginRegistry.getPlugin(pluginId);
    if (!plugin) {
      const error = `Plugin o ID ${pluginId} nie istnieje`;
      const result: PluginResult = {
        input,
        output: input,
        executionTime: 0,
        success: false,
        error
      };
      return result;
    }

    const startTime = Date.now();
    try {
      const output = await plugin.process(input);
      
      const result: PluginResult = {
        input,
        output,
        executionTime: Date.now() - startTime,
        success: true
      };
      
      // Aktualizacja stanu
      set((state) => ({
        plugins: {
          ...state.plugins,
          [pluginId]: { 
            ...state.plugins[pluginId] || {},
            lastResult: result,
            lastExecuted: Date.now() 
          }
        },
        history: [...state.history, result]
      }));
      
      return result;
    } catch (error) {
      const result: PluginResult = {
        input,
        output: input,
        executionTime: Date.now() - startTime,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
      
      // Aktualizacja stanu z błędem
      set((state) => ({
        plugins: {
          ...state.plugins,
          [pluginId]: { 
            ...state.plugins[pluginId] || {},
            lastResult: result,
            lastExecuted: Date.now() 
          }
        },
        history: [...state.history, result]
      }));
      
      return result;
    }
  },

  // Dodanie pluginu do kolejki
  queuePlugin: (pluginId: string) => {
    set((state) => ({
      queue: [...state.queue, pluginId]
    }));
  },

  // Usunięcie pluginu z kolejki
  removeFromQueue: (pluginId: string) => {
    set((state) => ({
      queue: state.queue.filter(id => id !== pluginId)
    }));
  },

  // Wyczyszczenie kolejki
  clearQueue: () => {
    set({ queue: [] });
  },

  // Wykonanie kolejki pluginów
  executeQueue: async (initialInput: string) => {
    const { queue } = get();
    if (queue.length === 0) return [];
    
    set({ processing: true });
    
    const results: PluginResult[] = [];
    let currentInput = initialInput;
    
    try {
      for (const pluginId of queue) {
        const result = await get().executePlugin(pluginId, currentInput);
        results.push(result);
        
        if (!result.success) break;
        currentInput = result.output;
      }
    } finally {
      set({ processing: false });
    }
    
    return results;
  }
});