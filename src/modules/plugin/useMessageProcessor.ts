/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/useMessageProcessor.ts
import { useCallback } from 'react';
import { pluginRegistry } from './plugin-registry';
import { usePluginStore } from './store';

export function useMessageProcessor() {
  const plugins = usePluginStore(state => state.plugins);
  
  const activePluginIds = Object.entries(plugins)
    .filter(([_, plugin]) => plugin.active)
    .map(([id]) => id);
  
  const processMessage = useCallback(async (message: string): Promise<string> => {
    let processedMessage = message;
    
    for (const pluginId of activePluginIds) {
      const plugin = pluginRegistry.getPlugin(pluginId);
      if (plugin) {
        try {
          processedMessage = await plugin.process(processedMessage);
        } catch (error) {
          console.error(`Error processing message with plugin ${pluginId}:`, error);
        }
      }
    }
    
    return processedMessage;
  }, [activePluginIds]);
  
  const processMessageWithSpecificPlugins = useCallback(async (
    message: string, 
    pluginIds: string[],
    nodePluginOptions?: { [pluginId: string]: any }
  ): Promise<string> => {
    let processedMessage = message;
    
    for (const pluginId of pluginIds) {
      const plugin = pluginRegistry.getPlugin(pluginId);
      if (plugin) {
        try {
          // Pass plugin options if available
          const options = nodePluginOptions?.[pluginId] || {};
          processedMessage = await plugin.process(processedMessage, options);
        } catch (error) {
          console.error(`Error processing message with plugin ${pluginId}:`, error);
        }
      }
    }
    
    return processedMessage;
  }, []);
  
  return {
    processMessage,
    processMessageWithSpecificPlugins,
    hasActivePlugins: activePluginIds.length > 0
  };
}