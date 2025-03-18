/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/processor.ts
import { useState, useEffect } from 'react';
import { usePluginStore } from './store';

export const useMessageProcessor = () => {
  const { plugins, activePlugins, pluginOptions } = usePluginStore();
  
  // Przetwarzanie przez wszystkie aktywne pluginy
  const processWithActivePlugins = async (text: string) => {
    let result = text;
    
    for (const pluginId of activePlugins) {
      const plugin = plugins[pluginId];
      if (plugin) {
        const options = pluginOptions[pluginId] || {};
        result = await plugin.process(result, options);
      }
    }
    
    return result;
  };
  
  // Przetwarzanie przez wybrane pluginy
  const processWithPlugins = async (
    text: string, 
    pluginIds: string[], 
    nodeOptions?: Record<string, Record<string, any>>
  ) => {
    let result = text;
    
    for (const pluginId of pluginIds) {
      const plugin = plugins[pluginId];
      if (plugin) {
        // Używanie options specyficznych dla node lub domyślnych
        const options = nodeOptions?.[pluginId] || pluginOptions[pluginId] || {};
        result = await plugin.process(result, options);
      }
    }
    
    return result;
  };
  
  return {
    processWithActivePlugins,
    processWithPlugins
  };
};
