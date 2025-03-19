// src/modules/flowPlayer/components/MessageProcessors/UserMessageProcessor.tsx
import React, { useCallback } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useFlowPlayer } from "../../context/FlowContext";
import { usePluginStore } from "@/modules/plugin";


export const UserMessageProcessor: React.FC = React.memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    userMessage, 
    updateUserMessage, 
    nextNode, 
    isProcessing 
  } = useFlowPlayer();
  
  // Get plugin data
  const { plugins } = usePluginStore();
  
  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    // Don't do anything if message is empty, no current node, or already processing
    if (!userMessage.trim() || !currentNode || isProcessing) {
      return;
    }
    
    let processedMessage = userMessage;
    
    // Pre-process with plugin if applicable
    if (currentNode.plugin) {
      const plugin = plugins[currentNode.plugin];
      if (plugin?.processUserInput) {
        try {
          // Call plugin's user input processor
          const result = await plugin.processUserInput({
            currentValue: userMessage,
            options: currentNode.pluginOptions?.[currentNode.plugin] || {},
            onChange: updateUserMessage,
            provideCustomRenderer: () => {} // Currently unused
          });
          
          // Use result if returned
          if (result) {
            processedMessage = result;
          }
        } catch (error) {
          console.error("Error processing user input with plugin:", error);
        }
      }
    }
    
    // Send to next node
    nextNode(processedMessage);
  }, [
    userMessage, 
    currentNode, 
    isProcessing, 
    plugins, 
    updateUserMessage, 
    nextNode
  ]);
  
  // Handle enter key to send message
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Don't render if no current node
  if (!currentNode) {
    return null;
  }
  
  return (
    <Card className="flex-shrink-0 mt-auto user-message-processor">
      <CardContent className="pt-4">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={userMessage}
              onChange={(e) => updateUserMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-20 pr-12 resize-none"
              disabled={isProcessing}
            />
            
            {currentNode.contextSaveKey && currentNode.contextSaveKey !== '_none' && (
              <div className="absolute top-2 right-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                  Saves to: {currentNode.contextSaveKey}
                </span>
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSendMessage} 
            className="mb-1"
            disabled={!userMessage.trim() || isProcessing}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

// Set display name for better debugging
UserMessageProcessor.displayName = 'UserMessageProcessor';