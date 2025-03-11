// src/modules/plugins_system/initPlugins.ts
// Modify the useInitializePlugins hook to activate plugins after loading

import React, { useEffect } from 'react';
import { usePluginStore } from './pluginStore';
import { loadDevPlugins } from './loadPlugin';

// Hook to initialize the plugin system
export const useInitializePlugins = () => {
  const { registerPlugin, activatePlugin, getActivePlugins } = usePluginStore();
  
  useEffect(() => {
    const loadPlugins = async () => {
      console.log("Plugin initialization started");
      
      if (import.meta.env.DEV) {
        try {
          console.log("Loading development plugins...");
          
          // Load development plugins
          const devPlugins = await loadDevPlugins();
          
          // Log what we found
          console.log(`Found ${devPlugins.length} development plugins:`);
          devPlugins.forEach(p => {
            console.log(`- ${p.name} (${p.id})`);
          });
          
          // Register each development plugin AND activate it
          devPlugins.forEach(plugin => {
            console.log(`Registering development plugin: ${plugin.name} (${plugin.id})`);
            registerPlugin(plugin.id, plugin);
            // Add this line to activate the plugin after registration
            activatePlugin(plugin.id);
          });
          
          // Check what's registered after the process
          console.log("Plugins registered:", getActivePlugins());
        } catch (error) {
          console.error('Error initializing plugin system:', error);
        }
      } else {
        console.log("Not in development mode, skipping dev plugin loading");
      }
    };
    
    loadPlugins();
  }, [registerPlugin, activatePlugin, getActivePlugins]);
};

// Component to initialize plugins
export const PluginInitializer: React.FC = () => {
  useInitializePlugins();
  
  // This component doesn't render anything
  return null;
};