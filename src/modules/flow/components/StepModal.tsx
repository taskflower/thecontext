import React from "react";
import { X, MessageCircle, Bot, Puzzle } from "lucide-react";
import { StepModalProps } from "../../ui/types";
import StepPluginWrapper from "@/modules/plugins/wrappers/StepPluginWrapper";
import { cn } from "@/utils/utils";

export const StepModal: React.FC<StepModalProps> = ({
  steps,
  currentStep,
  onNext,
  onPrev,
  onClose,
}) => {
  const currentNode = steps[currentStep];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-medium text-card-foreground">
            Conversation Step {currentStep + 1} of {steps.length}: {currentNode.label}
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
            {/* Conversation Display */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="bg-muted/10 px-4 py-2 border-b border-border">
                <h4 className="font-medium">Chatbot Conversation</h4>
              </div>
              <div className="p-4 space-y-4">
                {/* User Message */}
                {currentNode.userPrompt && (
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-muted w-8 h-8 rounded-full flex items-center justify-center mr-3">
                      <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground mb-1">User:</p>
                      <div className={cn(
                        "bg-muted/30 rounded-lg py-2 px-3",
                        "dark:bg-muted/10 text-foreground"
                      )}>
                        {currentNode.userPrompt}
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Bot Message */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Assistant:</p>
                    <div className={cn(
                      "bg-primary/5 border-l-2 border-primary rounded-r-lg py-2 px-3",
                      "text-foreground"
                    )}>
                      {currentNode.assistantMessage}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plugin Display (if available) */}
            {currentNode.pluginKey && (
              <div className="border border-border rounded-lg overflow-hidden">
                <div className="bg-muted/10 px-4 py-2 border-b border-border flex items-center">
                  <Puzzle className="h-4 w-4 mr-2 text-primary" />
                  <h4 className="font-medium">Plugin: {currentNode.pluginKey}</h4>
                </div>
                <div className="p-4">
                  <StepPluginWrapper 
                    componentKey={currentNode.pluginKey} 
                    nodeData={currentNode} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Controls */}
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

            {currentStep < steps.length - 1 ? (
              <button
                onClick={onNext}
                className="px-3 py-1.5 rounded-md text-sm bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                Finish
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};