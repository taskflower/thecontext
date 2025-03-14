/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/plugins/PluginInitializer.tsx
import React, { useEffect } from 'react';


// Built-in plugins


import { registerStoresForPlugins } from '@/stores';
import { loadPlugins } from './PluginInterface';
import { usePluginStore } from '@/stores/pluginStore';
import { useNodeStore } from '@/stores/nodeStore';

// Define our core/built-in plugins


export const PluginInitializer: React.FC = () => {
  const { 
    plugins,
    registerPlugin, 
    activatePlugin,
    isPluginActive
  } = usePluginStore();
  
  const { nodes } = useNodeStore();
  
  // Initialize the plugin system
  useEffect(() => {
    const initializePlugins = async () => {
    
      
      // Register store API for plugins
      registerStoresForPlugins();
      // Load dynamic plugins in development mode
      if (import.meta.env.DEV) {
        try {
       
          const dynamicPlugins = await loadPlugins();
          
          dynamicPlugins.forEach(plugin => {
            if (!plugins[plugin.id]) {
           
              registerPlugin(plugin.id, plugin);
              // Dynamic plugins are not activated by default
            }
          });
          
        
        } catch (error) {
          console.error('Error loading dynamic plugins:', error);
        }
      }
      
    
    };
    
    initializePlugins();
  }, [plugins, registerPlugin, activatePlugin]);
  
  // Ensure plugins used by nodes are activated
  useEffect(() => {
    // Find all nodes with plugins
    const nodesWithPlugins = Object.values(nodes).filter((node:any) => node.data.pluginId);
    
    // Activate any plugins that are used by nodes but not active
    nodesWithPlugins.forEach((node:any) => {
      const pluginId = node.data.pluginId;
      if (pluginId && !isPluginActive(pluginId)) {
      
        activatePlugin(pluginId);
      }
    });
  }, [nodes, isPluginActive, activatePlugin]);
  
  // This component doesn't render anything
  return null;
};

export default PluginInitializer;