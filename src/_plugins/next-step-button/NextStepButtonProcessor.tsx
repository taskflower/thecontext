// src/plugins/next-step-button/NextStepButtonProcessor.tsx
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useFlowPlayer } from "@/modules/flowPlayer";
// import { usePluginStore } from "@/modules/plugin";
import { useWorkspaceContext } from "../../modules/context/hooks/useContext";
import { useAppStore } from "../../modules/store";

export const NextStepButtonProcessor: React.FC = React.memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    isNodeProcessed, 
    markNodeAsProcessed,
    nextNode
  } = useFlowPlayer();
  
  const { processTemplate } = useWorkspaceContext();
  const { addToConversation } = useAppStore();
  // const { plugins } = usePluginStore();
  
  // Track if node has been processed
  const [ setIsProcessed] = useState(false);
  const processedNodeRef = useRef<string | null>(null);
  
  // Process assistant message when node changes
  useEffect(() => {
    if (
      !currentNode || 
      !currentNode.assistant || 
      isNodeProcessed(currentNode.id) || 
      processedNodeRef.current === currentNode.id
    ) {
      return;
    }
    
    // Set refs to prevent duplicate processing
    processedNodeRef.current = currentNode.id;
    
    // Mark node as processed immediately
    markNodeAsProcessed(currentNode.id);
    setIsProcessed(true);
    
    // Process template based on context variables
    const processedMessage = processTemplate(currentNode.assistant);
    
    // Add to conversation
    addToConversation({
      role: "assistant",
      message: processedMessage
    });
  }, [
    currentNode?.id, 
    currentNode?.assistant, 
    isNodeProcessed, 
    markNodeAsProcessed,
    processTemplate,
    addToConversation
  ]);

  // Return null if no current node
  if (!currentNode) {
    return null;
  }
  
  // Get plugin options
  const options = currentNode.plugin === "next-step-button" && currentNode.pluginOptions
    ? currentNode.pluginOptions["next-step-button"] || {}
    : {};
  
  // Get plugin settings
  const buttonText = options.button_text || "Continue to Next Step";
  const buttonColor = options.button_color || "blue";
  const autoProgress = options.auto_progress !== false;
  
  // Get color class based on selected color
  const getColorClass = () => {
    switch (buttonColor) {
      case "green": return "bg-green-500 hover:bg-green-600";
      case "red": return "bg-red-500 hover:bg-red-600";
      case "purple": return "bg-purple-500 hover:bg-purple-600";
      case "blue":
      default: return "bg-blue-500 hover:bg-blue-600";
    }
  };
  
  // Process message for display
  const displayMessage = currentNode.assistant
    ? processTemplate(currentNode.assistant)
    : "";
  
  // Handle button click
  const handleNextStep = () => {
    if (autoProgress) {
      // Send a predefined message when continuing
      nextNode("Continuing to next step...");
    }
  };
  
  return (
    <Card className="assistant-message-processor border shadow-none mb-3">
      <CardContent className="pt-3 px-4">
        <div className="mb-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
            Assistant
          </span>
        </div>
        
        {/* Display message */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-900/50 min-h-[100px] mb-3">
          {displayMessage ? (
            <p className="whitespace-pre-wrap text-sm">{displayMessage}</p>
          ) : (
            <p className="text-muted-foreground italic text-sm">This node has no assistant message.</p>
          )}
        </div>
        
        {/* Next step button */}
        <div className="flex justify-end">
          <Button
            onClick={handleNextStep}
            className={`${getColorClass()} text-white transition-all transform hover:scale-105`}
          >
            {buttonText}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

NextStepButtonProcessor.displayName = 'NextStepButtonProcessor';