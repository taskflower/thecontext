import React, { useCallback, useState } from "react";
import { useAppStore } from "../store";
import { StepModal } from "@/components/APPUI";
import { GraphNode } from "../types";
import { calculateFlowPath } from "./flowUtils";
import { ConversationModal } from "../conversation/ConversationModal";

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
      addToConversation({
        role: "assistant",
        message: currentNode.assistant
      });
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
          Play Flow
        </button>
        <button
          onClick={() => setShowConversation(true)}
          className="p-2 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600"
        >
          Show Conversation
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
                <h3 className="text-sm font-semibold text-blue-800">Assistant:</h3>
                <p>{step.assistant}</p>
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-semibold text-gray-800">Your response:</h3>
                <textarea
                  className="w-full border rounded-md p-2 min-h-[100px]"
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