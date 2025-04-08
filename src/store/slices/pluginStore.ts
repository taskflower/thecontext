// store/slices/pluginStore.ts
import { StateCreator } from 'zustand';
import type { AppStore, Plugin, Node } from '../types';
import { pluginRegistry } from '@/plugins';

const createPluginSlice: StateCreator<
  AppStore, 
  [], 
  [], 
  {
    registeredPlugins: Plugin[];
    registerPlugin: (plugin: Plugin) => void;
    applyNodePlugins: (node: Node) => Node;
  }
> = (set) => ({
  // Lista zarejestrowanych pluginów - teraz głównie dla kompatybilności
  // Faktyczna rejestracja odbywa się w pluginRegistry
  registeredPlugins: [],

  // Rejestrowanie nowego pluginu - teraz korzysta z pluginRegistry
  registerPlugin: (plugin) => {
    // Dodatkowo rejestruj plugin w pluginRegistry
    pluginRegistry.register({
      id: plugin.id,
      name: plugin.name,
      description: plugin.type,
      transformNode: (node) => node, // Domyślna implementacja
      validateNodeData: () => ({ isValid: true }),
      renderConfigForm: () => null,
      renderInputComponent: () => null
    });
    
    // Aktualizuj również stan dla kompatybilności wstecznej
    set(state => ({
      registeredPlugins: [...state.registeredPlugins, plugin]
    }));
  },

  // Aplikowanie pluginów do węzła - wykorzystuje pluginRegistry
  applyNodePlugins: (node) => {
    if (!node.pluginType) return node;
    
    console.log("Applying plugins to node:", node.id, "plugin type:", node.pluginType);
    
    try {
      // Przekazanie węzła do transformacji przez pluginRegistry
      return pluginRegistry.transformNode(node);
    } catch (error) {
      console.error("Error applying plugins to node:", error);
      return node;
    }
  }
});

export default createPluginSlice;