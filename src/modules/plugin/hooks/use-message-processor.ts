// src/modules/plugin/hooks/use-message-processor.ts
import { useCallback } from 'react';
import { pluginRegistry } from '../plugin-registry';
import { usePluginStore } from '../store';

export function useMessageProcessor() {
  const plugins = usePluginStore(state => state.plugins);
  
  // Pobierz aktywne pluginy
  const activePluginIds = Object.entries(plugins)
    .filter(([_, plugin]) => plugin.active)
    .map(([id]) => id);
  
  // Funkcja do przetwarzania wiadomości przez aktywne pluginy
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
  
  // Nowa funkcja do przetwarzania wiadomości z konkretnymi wtyczkami
  const processMessageWithSpecificPlugins = useCallback(async (message: string, pluginIds: string[]): Promise<string> => {
    let processedMessage = message;
    
    for (const pluginId of pluginIds) {
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
  }, []);
  
  return {
    processMessage,
    processMessageWithSpecificPlugins,
    hasActivePlugins: activePluginIds.length > 0
  };
}