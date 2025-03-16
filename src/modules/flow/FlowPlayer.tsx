// Modyfikacja w FlowPlayer.tsx
import React, { useCallback, useState, useEffect } from "react";
import { useAppStore } from "../store";
import { StepModal } from "@/components/APPUI";
import { GraphNode } from "../types";
import { calculateFlowPath } from "./flowUtils";
import { ConversationModal } from "../conversation/ConversationModal";
import { MessageProcessor } from "../plugin/components/MessageProcessor";
import { pluginRegistry } from "../plugin/plugin-registry";

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
      <div className="absolute top-2 right-2 z-10 flex space-x-2">
        <button
          onClick={handlePlay}
          className="p-2 rounded-md bg-blue-500 text-white text-xs font-medium hover:bg-blue-600"
        >
          Odtwórz Flow
        </button>
        <button
          onClick={() => setShowConversation(true)}
          className="p-2 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600"
        >
          Pokaż Konwersację
        </button>
      </div>

      {isPlaying && flowPath.length > 0 && (
        <StepModal
          steps={flowPath}
          currentStep={currentNodeIndex}
          onNext={handleNext}
          onPrev={handlePrev}
          onClose={handleClose}
          renderStepContent={(step) => (
            <div className="flex flex-col space-y-4 p-2">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-800">Asystent:</h3>
                {/* Dodajemy informację o używanych wtyczkach */}
                {step.plugins && step.plugins.length > 0 && (
                  <div className="mb-2 text-xs text-gray-600">
                    Używane wtyczki: {step.plugins.map(pluginId => {
                      const plugin = pluginRegistry.getPlugin(pluginId);
                      return plugin ? plugin.config.name : pluginId;
                    }).join(', ')}
                  </div>
                )}
                {/* Dodajemy niewidoczny processor dla bieżącego kroku z przekazaniem wtyczek węzła */}
                <MessageProcessor 
                  message={step.assistant}
                  onProcessed={setProcessedMessage}
                  autoProcess={true}
                  nodePlugins={step.plugins}
                />
                <p>{processedMessage || step.assistant}</p>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-800">Twoja odpowiedź:</h3>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
                  placeholder="Wpisz swoją wiadomość tutaj..."
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