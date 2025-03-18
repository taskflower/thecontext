/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/components/MessageProcessor.tsx
import React, { useState, useEffect } from 'react';
import { useMessageProcessor } from '../processor';

interface MessageProcessorProps {
  message: string;
  nodePlugins?: string[];
  nodePluginOptions?: Record<string, Record<string, any>>;
  onProcessed?: (processed: string) => void;
  autoProcess?: boolean;
  onSimulateFinish?: () => void;
}

export const MessageProcessor: React.FC<MessageProcessorProps> = ({
  message,
  nodePlugins,
  nodePluginOptions,
  onProcessed,
  autoProcess = false,
  onSimulateFinish
}) => {
  const [processing, setProcessing] = useState(false);
  const { processWithPlugins, processWithActivePlugins } = useMessageProcessor();

  useEffect(() => {
    if (!autoProcess) return;
    
    const processMessage = async () => {
      setProcessing(true);
      try {
        let result;
        
        if (nodePlugins?.length) {
          // Użyj określonych pluginów dla node
          result = await processWithPlugins(message, nodePlugins, nodePluginOptions);
        } else {
          // Użyj wszystkich aktywnych pluginów
          result = await processWithActivePlugins(message);
        }
        
        if (onProcessed) onProcessed(result);
        
        // Symulacja zakończenia (dla FlowPlayer)
        if (onSimulateFinish) {
          setTimeout(onSimulateFinish, 500);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      } finally {
        setProcessing(false);
      }
    };
    
    processMessage();
  }, [
    message, 
    nodePlugins, 
    nodePluginOptions, 
    autoProcess, 
    onProcessed,
    onSimulateFinish,
    processWithPlugins,
    processWithActivePlugins
  ]);

  if (processing) {
    return <div className="text-muted-foreground italic py-2">Processing message...</div>;
  }

  return null;
};