// src/modules/plugin/components/MessageProcessor.tsx
import React, { useEffect, useState } from 'react';
import { useMessageProcessor } from '../hooks/use-message-processor';

interface MessageProcessorProps {
  message: string;
  onProcessed: (processedMessage: string) => void;
  autoProcess?: boolean;
  nodePlugins?: string[]; // Lista ID wtyczek przypisanych do węzła
}

export const MessageProcessor: React.FC<MessageProcessorProps> = ({
  message,
  onProcessed,
  autoProcess = true,
  nodePlugins
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalMessage] = useState(message || '');
  const { processMessage, hasActivePlugins, processMessageWithSpecificPlugins } = useMessageProcessor();
  
  // Automatyczne przetwarzanie wiadomości, gdy komponent jest montowany
  useEffect(() => {
    if (autoProcess && originalMessage) {
      handleProcess();
    } else {
      // Jeśli nie ma aktywnych pluginów lub automatycznego przetwarzania, po prostu przekaż oryginalną wiadomość
      onProcessed(originalMessage);
    }
  }, []);
  
  // Funkcja do ręcznego przetwarzania
  const handleProcess = async () => {
    if (isProcessing || !originalMessage) return;
    
    setIsProcessing(true);
    try {
      let processedMessage;
      
      // Jeśli węzeł ma przypisane konkretne wtyczki, użyj tylko ich
      if (nodePlugins && nodePlugins.length > 0) {
        processedMessage = await processMessageWithSpecificPlugins(originalMessage, nodePlugins);
      } else {
        // W przeciwnym razie użyj wszystkich aktywnych wtyczek
        processedMessage = await processMessage(originalMessage);
      }
      
      onProcessed(processedMessage);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Komponent może nie renderować nic (jeśli jest używany tylko dla efektów ubocznych)
  // lub może renderować interfejs do ręcznego sterowania przetwarzaniem
  return autoProcess ? null : (
    <div className="message-processor">
      <button 
        onClick={handleProcess}
        disabled={isProcessing || !originalMessage || (!hasActivePlugins && (!nodePlugins || nodePlugins.length === 0))}
        className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm disabled:bg-gray-300"
      >
        {isProcessing ? 'Przetwarzanie...' : 'Przetwórz z wtyczkami'}
      </button>
    </div>
  );
};