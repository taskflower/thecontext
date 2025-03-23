import React, { useState } from "react";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { StepModalProps } from "../types";
import { cn } from "@/utils/utils";
import { Bot, Loader2, Puzzle, Send, X } from "lucide-react";

export const StepModal: React.FC<StepModalProps> = ({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  const currentNode = steps[currentStep];
  const [userInput, setUserInput] = useState(currentNode?.userPrompt || "");
  const [isProcessing, setIsProcessing] = useState(false);

  // Action for sending user message
  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    setIsProcessing(true);

    // Here you could add integration with an API or store to save responses
    // e.g., updateNodeMessage(currentNode.id, { userPrompt: userInput });

    // Simulating processing (in a real app this would be an API call)
    setTimeout(() => {
      setIsProcessing(false);
      onNext(); // Move to next step after receiving response
    }, 1000);
  };

  if (!currentNode) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-card-foreground">
            Step {currentStep + 1} of {steps.length}: {currentNode.label}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-accent/80"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 space-y-4">
            {/* Assistant message */}
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Assistant:
                </p>
                <div className="bg-primary/5 border-l-2 border-primary rounded-r-lg py-2 px-3 text-foreground">
                  {currentNode.assistantMessage ||
                    "Waiting for your response..."}
                </div>
              </div>
            </div>

            {/* Plugin (if exists) */}
            {currentNode.pluginKey && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/10 px-4 py-2 border-b border-border flex items-center">
                  <Puzzle className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="font-medium">
                    Plugin: {currentNode.pluginKey}
                  </h4>
                </div>
                <div className="p-4">
                  <StepPluginWrapper
                    componentKey={currentNode.pluginKey}
                    nodeData={currentNode}
                  />
                </div>
              </div>
            )}

            {/* User input field */}
            <div className="mt-6">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Your response:
              </p>
              <div className="flex">
                <textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 p-3 border border-border rounded-l-md focus:outline-none focus:ring-1 focus:ring-primary"
                  rows={3}
                ></textarea>
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isProcessing}
                  className="px-4 bg-primary text-primary-foreground rounded-r-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={onPrev}
              disabled={currentStep === 0}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm",
                currentStep === 0
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-accent text-accent-foreground hover:bg-accent/80"
              )}
            >
              Previous
            </button>

            <button
              onClick={onNext}
              className="px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isProcessing}
            >
              {currentStep < steps.length - 1 ? "Next" : "Finish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
