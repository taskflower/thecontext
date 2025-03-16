// src/modules/flow/FlowPlayer.tsx
import React, { useCallback, useState, useEffect } from "react";
import { Play, MessageSquare } from "lucide-react";
import { useAppStore } from "../store";
import { StepModal } from "@/components/APPUI";
import { GraphNode } from "../types";
import { calculateFlowPath } from "./flowUtils";
import { ConversationModal } from "../conversation/ConversationModal";
import { MessageProcessor } from "../plugin/components/MessageProcessor";
import { pluginRegistry } from "../plugin/plugin-registry";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const FlowPlayer: React.FC = () => {
  const getCurrentScenario = useAppStore((state) => state.getCurrentScenario);
  const addToConversation = useAppStore((state) => state.addToConversation);
  const clearConversation = useAppStore((state) => state.clearConversation);
  const setUserMessage = useAppStore((state) => state.setUserMessage);
  // Force component to update when state changes
  useAppStore((state) => state.stateVersion);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [flowPath, setFlowPath] = useState<GraphNode[]>([]);
  const [showConversation, setShowConversation] = useState(false);
  
  // Dodajemy stan dla przetworzonych wiadomości
  const [processedMessage, setProcessedMessage] = useState<string | null>(null);

  // Resetuj przetworzoną wiadomość przy zmianie kroku
  useEffect(() => {
    setProcessedMessage(null);
  }, [currentNodeIndex]);

  const handlePlay = useCallback(() => {
    const scenario = getCurrentScenario();
    if (scenario) {
      const path = calculateFlowPath(scenario.children, scenario.edges);
      if (path.length > 0) {
        setFlowPath(path);
        setCurrentNodeIndex(0);
        setIsPlaying(true);
        clearConversation();
      }
    }
  }, [getCurrentScenario, clearConversation]);

  const handleNext = () => {
    const currentNode = flowPath[currentNodeIndex];
    
    // Add assistant message to conversation
    if (currentNode && currentNode.assistant) {
      // Używamy przetworzonej wiadomości jeśli jest dostępna, w przeciwnym razie oryginalnej
      const messageToAdd = processedMessage || currentNode.assistant;
      
      addToConversation({
        role: "assistant",
        message: messageToAdd
      });
      
      // Resetujemy przetworzoną wiadomość po dodaniu do konwersacji
      setProcessedMessage(null);
    }
    
    // Add user message to conversation if it exists
    if (currentNode && currentNode.userMessage) {
      addToConversation({
        role: "user",
        message: currentNode.userMessage
      });
    }

    // Move to the next node
    const newIndex = Math.min(currentNodeIndex + 1, flowPath.length - 1);
    setCurrentNodeIndex(newIndex);
  };

  // Dodana funkcja handlePrev, która była brakująca
  const handlePrev = () => {
    // We don't remove from conversation history when going back
    setCurrentNodeIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleClose = () => {
    // Force close regardless of state
    setIsPlaying(false);
    setCurrentNodeIndex(0);
    setFlowPath([]);
  };

  const handleUserMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const currentNode = flowPath[currentNodeIndex];
    if (currentNode) {
      // Update user message in store
      setUserMessage(currentNode.id, e.target.value);
      
      // Also update local state to ensure re-render
      const updatedPath = [...flowPath];
      updatedPath[currentNodeIndex] = {
        ...currentNode,
        userMessage: e.target.value
      };
      setFlowPath(updatedPath);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <Button 
          size="sm" 
          onClick={handlePlay}
          className="px-3 py-2 space-x-1"
        >
          <Play className="h-4 w-4 mr-1" />
          <span>Play Flow</span>
        </Button>
        <Button 
          size="sm" 
          onClick={() => setShowConversation(true)}
          variant="outline"
          className="px-3 py-2 space-x-1"
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          <span>Show Conversation</span>
        </Button>
      </div>

      {isPlaying && flowPath.length > 0 && (
        <StepModal
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
          renderStepContent={(step) => (
            <div className="flex flex-col space-y-6">
              <Card className="p-4 border-muted bg-muted/20">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Assistant</h3>
                    
                    {step.plugins && step.plugins.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {step.plugins.map(pluginId => {
                          const plugin = pluginRegistry.getPlugin(pluginId);
                          return plugin ? (
                            <Badge key={pluginId} variant="outline" className="text-xs">
                              {plugin.config.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Hidden message processor */}
                  <MessageProcessor 
                    message={step.assistant}
                    onProcessed={setProcessedMessage}
                    autoProcess={true}
                    nodePlugins={step.plugins}
                  />
                  
                  <div className="text-sm whitespace-pre-line">
                    {processedMessage || step.assistant}
                  </div>
                </div>
              </Card>
              
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-semibold">Your Response</h3>
                <Textarea
                  className="min-h-[120px] resize-none"
                  placeholder="Type your message here..."
                  value={step.userMessage || ''}
                  onChange={handleUserMessageChange}
                />
              </div>
            </div>
          )}
        />
      )}

      <ConversationModal 
        isOpen={showConversation} 
        onClose={() => setShowConversation(false)} 
      />
    </>
  );
};