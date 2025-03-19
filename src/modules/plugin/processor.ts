/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/processor.ts
import { useCallback } from 'react';
import { usePluginStore } from './store';

export interface MessageProcessorResult {
  processedText: string;
  processingLog: Array<{
    pluginId: string;
    status: 'success' | 'error';
    message?: string;
  }>;
}

export const useMessageProcessor = () => {
  const { plugins, activePlugins, pluginOptions } = usePluginStore();
  
  /**
   * Process text through all active plugins
   */
  const processWithActivePlugins = useCallback(async (text: string): Promise<string> => {
    let result = text;
    
    for (const pluginId of activePlugins) {
      const plugin = plugins[pluginId];
      if (plugin) {
        const options = pluginOptions[pluginId] || {};
        try {
          result = await plugin.process(result, options);
        } catch (error) {
          console.error(`Error processing with plugin ${pluginId}:`, error);
        }
      }
    }
    
    return result;
  }, [plugins, activePlugins, pluginOptions]);
  
  /**
   * Process text through specific plugins with detailed logs
   */
  const processWithPluginsDetailed = useCallback(
    async (
      text: string, 
      pluginIds: string[], 
      nodeOptions?: Record<string, Record<string, any>>
    ): Promise<MessageProcessorResult> => {
      let processedText = text;
      const processingLog: MessageProcessorResult['processingLog'] = [];
      
      for (const pluginId of pluginIds) {
        const plugin = plugins[pluginId];
        if (plugin) {
          // Use node-specific options or global plugin options
          const options = nodeOptions?.[pluginId] || pluginOptions[pluginId] || {};
          
          try {
            processedText = await plugin.process(processedText, options);
            processingLog.push({
              pluginId,
              status: 'success'
            });
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            processingLog.push({
              pluginId,
              status: 'error',
              message: errorMessage
            });
            console.error(`Error processing with plugin ${pluginId}:`, error);
          }
        }
      }
      
      return {
        processedText,
        processingLog
      };
    }, 
    [plugins, pluginOptions]
  );
  
  /**
   * Process text through specific plugins (simplified version)
   */
  const processWithPlugins = useCallback(
    async (
      text: string, 
      pluginIds: string[], 
      nodeOptions?: Record<string, Record<string, any>>
    ): Promise<string> => {
      const result = await processWithPluginsDetailed(text, pluginIds, nodeOptions);
      return result.processedText;
    },
    [processWithPluginsDetailed]
  );
  
  return {
    processWithActivePlugins,
    processWithPlugins,
    processWithPluginsDetailed
  };
};