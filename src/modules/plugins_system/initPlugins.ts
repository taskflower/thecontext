// src/modules/plugins_system/initPlugins.ts
import React, { useEffect } from 'react';
import { usePluginStore } from './pluginStore';
import { loadDevPlugins } from './loadPlugin';

// Import built-in plugins
import WorkspaceContextUpdater from '../../plugins/workspace-context-updater';
import RequestSimulator from '../../plugins/request-simulator';
import TextAnalyzer from '../../plugins/text-analyzer';

// Hook to initialize the plugin system
export const useInitializePlugins = () => {
  const { registerPlugin, activatePlugin, getActivePlugins, plugins } = usePluginStore();
  
  useEffect(() => {
    const loadPlugins = async () => {
      console.log("Plugin initialization started");
      
      // First, register core plugins that are required for workspace functionality
      const builtInPlugins = [
        WorkspaceContextUpdater,
        RequestSimulator,
        TextAnalyzer
      ];
      
      // Register and activate all built-in plugins
      builtInPlugins.forEach(plugin => {
        if (!plugins[plugin.id]) {
          console.log(`Registering built-in plugin: ${plugin.name} (${plugin.id})`);
          registerPlugin(plugin.id, plugin);
          activatePlugin(plugin.id);
        }
      });
      
      // Then load dynamically discovered plugins (in development mode)
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
            if (!plugins[plugin.id]) {
              console.log(`Registering development plugin: ${plugin.name} (${plugin.id})`);
              registerPlugin(plugin.id, plugin);
              activatePlugin(plugin.id);
            }
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
  }, [registerPlugin, activatePlugin, getActivePlugins, plugins]);
};

// Component to initialize plugins and restore plugin connections
export const PluginInitializer: React.FC = () => {
  useInitializePlugins();
  
  // Perform one-time check to ensure nodes with plugins are properly connected
  useEffect(() => {
    // This will run only once on component mount
    const { nodes } = useScenarioStore.getState();
    const { plugins, activatePlugin } = usePluginStore.getState();
    let fixedCount = 0;
    
    // Check if any nodes have plugin references that aren't activated
    Object.values(nodes).forEach(node => {
      if (node.pluginId && plugins[node.pluginId]) {
        // Ensure the plugin is activated
        activatePlugin(node.pluginId);
        fixedCount++;
        console.log(`Ensuring plugin ${node.pluginId} is activated for node ${node.id}`);
      }
    });
    
    if (fixedCount > 0) {
      console.log(`Fixed ${fixedCount} plugin connections`);
    }
  }, []);
  
  // This component doesn't render anything
  return null;
};

// Add missing import
import { useScenarioStore } from '../scenarios_module/scenarioStore';