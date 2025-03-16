import { useState, useCallback } from 'react';
import { usePluginStore } from '../store';
import { pluginRegistry } from '../plugin-registry';

import { PluginQueue } from '../queue/plugin-queue';
import { PluginResult } from '../types';

interface UsePluginOptions {
  autoActivate?: boolean;
  trackResults?: boolean;
}

export function usePlugin(pluginId: string, options: UsePluginOptions = {}) {
  const { autoActivate = false, trackResults = true } = options;
  
  const [lastResult, setLastResult] = useState<PluginResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  
  const { 
    activatePlugin, 
    deactivatePlugin,
    executePlugin
  } = usePluginStore();
  
  // Pobierz plugin z rejestru
  const plugin = pluginRegistry.getPlugin(pluginId);
  
  // Aktywuj plugin jeśli potrzeba
  useCallback(() => {
    if (autoActivate && plugin) {
      activatePlugin(pluginId);
    }
  }, [autoActivate, pluginId, plugin, activatePlugin]);
  
  // Wykonanie pluginu
  const execute = useCallback(async (input: string): Promise<PluginResult> => {
    if (!plugin) {
      const errorResult: PluginResult = {
        input,
        output: input,
        executionTime: 0,
        success: false,
        error: `Plugin o ID ${pluginId} nie istnieje`
      };
      if (trackResults) {
        setLastResult(errorResult);
      }
      return errorResult;
    }
    
    setIsExecuting(true);
    try {
      const result = await executePlugin(pluginId, input);
      if (trackResults) {
        setLastResult(result);
      }
      return result;
    } finally {
      setIsExecuting(false);
    }
  }, [plugin, pluginId, executePlugin, trackResults]);
  
  // Dodanie do kolejki
  const addToQueue = useCallback(() => {
    PluginQueue.addToQueue(pluginId);
  }, [pluginId]);
  
  // Usunięcie z kolejki
  const removeFromQueue = useCallback(() => {
    PluginQueue.removeFromQueue(pluginId);
  }, [pluginId]);

  return {
    plugin,
    execute,
    isExecuting,
    lastResult,
    activate: () => activatePlugin(pluginId),
    deactivate: () => deactivatePlugin(pluginId),
    addToQueue,
    removeFromQueue
  };
}