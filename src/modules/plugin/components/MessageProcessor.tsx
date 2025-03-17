/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/plugin/components/MessageProcessor.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useMessageProcessor } from '../useMessageProcessor';

interface MessageProcessorProps {
  message: string;
  onProcessed: (processedMessage: string) => void;
  autoProcess?: boolean;
  nodePlugins?: string[];
  nodePluginOptions?: { [pluginId: string]: any }; // Add plugin options
  onSimulateFinish?: () => void;
}

export const MessageProcessor: React.FC<MessageProcessorProps> = ({
  message,
  onProcessed,
  autoProcess = true,
  nodePlugins,
  nodePluginOptions,
  onSimulateFinish
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalMessage] = useState(message || '');
  const [showSimulateButton, setShowSimulateButton] = useState(false);
  const { processMessage, hasActivePlugins, processMessageWithSpecificPlugins } = useMessageProcessor();
  
  // Check if message-simulator plugin is connected
  useEffect(() => {
    if (nodePlugins?.includes('message-simulator')) {
      setShowSimulateButton(true);
    } else {
      setShowSimulateButton(false);
    }
  }, [nodePlugins]);
  
  // Automatically process message when component mounts
  useEffect(() => {
    if (autoProcess && originalMessage) {
      handleProcess();
    } else {
      // If no active plugins or automatic processing, just pass the original message
      onProcessed(originalMessage);
    }
  }, []);
  
  // Function to manually process
  const handleProcess = async () => {
    if (isProcessing || !originalMessage) return;
    
    setIsProcessing(true);
    try {
      let processedMessage;
      
      // If the node has specific plugins assigned, use only those
      if (nodePlugins && nodePlugins.length > 0) {
        processedMessage = await processMessageWithSpecificPlugins(
          originalMessage, 
          nodePlugins,
          nodePluginOptions
        );
      } else {
        // Otherwise use all active plugins
        processedMessage = await processMessage(originalMessage);
      }
      
      onProcessed(processedMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to simulate sending a message and proceeding
  const handleSimulate = async () => {
    setIsProcessing(true);
    try {
      // First process the message
      let processedMessage;
      if (nodePlugins && nodePlugins.length > 0) {
        processedMessage = await processMessageWithSpecificPlugins(
          originalMessage, 
          nodePlugins,
          nodePluginOptions
        );
      } else {
        processedMessage = await processMessage(originalMessage);
      }
      
      onProcessed(processedMessage);
      
      // Simulate a short delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Proceed to the next step
      if (onSimulateFinish) {
        onSimulateFinish();
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Don't render anything if no simulation button and auto processing
  if (!showSimulateButton && autoProcess) return null;
  
  return (
    <div className="message-processor mt-2">
      {showSimulateButton && (
        <Button 
          onClick={handleSimulate}
          disabled={isProcessing}
          className="flex items-center gap-2"
          size="sm"
        >
          <Send className="h-4 w-4" />
          {isProcessing ? 'Sending...' : 'Simulate sending'}
        </Button>
      )}
      
      {!autoProcess && !showSimulateButton && (
        <Button 
          onClick={handleProcess}
          disabled={isProcessing || !originalMessage || (!hasActivePlugins && (!nodePlugins || nodePlugins.length === 0))}
          variant="secondary"
          size="sm"
        >
          {isProcessing ? 'Processing...' : 'Process with plugins'}
        </Button>
      )}
    </div>
  );
};