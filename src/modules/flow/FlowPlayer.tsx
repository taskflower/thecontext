import React, { useCallback, useState } from "react";
import { useAppStore } from "../store";
import { StepModal } from "@/components/APPUI";
import { GraphNode } from "../types";
import { calculateFlowPath } from "./flowUtils";

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
  const conversation = useAppStore((state) => state.conversation);

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

    setCurrentNodeIndex((prev) => Math.min(prev + 1, flowPath.length - 1));
  };

  const handlePrev = () => {
    // We don't remove from conversation history when going back
    setCurrentNodeIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleClose = () => {
    setIsPlaying(false);
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

      {showConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Conversation History</h2>
              <button 
                onClick={() => setShowConversation(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Role</th>
                    <th className="border p-2 text-left">Message</th>
                  </tr>
                </thead>
                <tbody>
                  {conversation.length > 0 ? (
                    conversation.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                        <td className="border p-2 font-medium capitalize">
                          {item.role}
                        </td>
                        <td className="border p-2">
                          {item.message}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="border p-4 text-center text-gray-500">
                        No conversation yet. Play the flow to generate messages.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};