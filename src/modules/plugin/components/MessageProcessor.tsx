import React, { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { useMessageProcessor } from '../useMessageProcessor';

interface MessageProcessorProps {
  message: string;
  onProcessed: (processedMessage: string) => void;
  autoProcess?: boolean;
  nodePlugins?: string[];
  onSimulateFinish?: () => void; // Callback do przejścia do następnego kroku
}

export const MessageProcessor: React.FC<MessageProcessorProps> = ({
  message,
  onProcessed,
  autoProcess = true,
  nodePlugins,
  onSimulateFinish
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalMessage] = useState(message || '');
  const [showSimulateButton, setShowSimulateButton] = useState(false);
  const { processMessage, hasActivePlugins, processMessageWithSpecificPlugins } = useMessageProcessor();
  
  // Sprawdź, czy jest podłączony plugin symulatora
  useEffect(() => {
    if (nodePlugins?.includes('message-simulator')) {
      setShowSimulateButton(true);
    } else {
      setShowSimulateButton(false);
    }
  }, [nodePlugins]);
  
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

  // Funkcja do symulacji wysłania wiadomości i przejścia dalej
  const handleSimulate = async () => {
    setIsProcessing(true);
    try {
      // Najpierw przetwórz wiadomość
      let processedMessage;
      if (nodePlugins && nodePlugins.length > 0) {
        processedMessage = await processMessageWithSpecificPlugins(originalMessage, nodePlugins);
      } else {
        processedMessage = await processMessage(originalMessage);
      }
      
      onProcessed(processedMessage);
      
      // Symuluj krótkie opóźnienie
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Przejdź do następnego kroku
      if (onSimulateFinish) {
        onSimulateFinish();
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Nie renderuj nic jeśli nie ma przycisku symulacji
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
          {isProcessing ? 'Wysyłanie...' : 'Symuluj wysyłanie'}
        </Button>
      )}
      
      {!autoProcess && !showSimulateButton && (
        <Button 
          onClick={handleProcess}
          disabled={isProcessing || !originalMessage || (!hasActivePlugins && (!nodePlugins || nodePlugins.length === 0))}
          className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm disabled:bg-gray-300"
        >
          {isProcessing ? 'Przetwarzanie...' : 'Przetwórz z wtyczkami'}
        </Button>
      )}
    </div>
  );
};