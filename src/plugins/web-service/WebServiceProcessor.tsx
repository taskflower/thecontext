// src/plugins/web-service/WebServiceProcessor.tsx
import { useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { useWorkspaceContext } from "../../modules/context/hooks/useContext";
import { useAppStore } from "../../modules/store";
import { memo } from "react";


export const WebServiceProcessor: React.FC = memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    isNodeProcessed, 
    markNodeAsProcessed,
    updateUserMessage
  } = useFlowPlayer();
  
  const { processTemplate } = useWorkspaceContext();
  const { addToConversation } = useAppStore();
  
  // Track if node has been processed
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
  const options = currentNode.plugin === "web-service" && currentNode.pluginOptions
    ? currentNode.pluginOptions["web-service"] || {}
    : {};
  
  // Get plugin settings
  const buttonText = options.button_text || "Auto-fill Input";
  const fillText = options.fill_text || "hello";
  const buttonColor = options.button_color || "green";
  
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
  
  // Handle button click to fill the user input
  const handleAutoFill = () => {
    updateUserMessage(fillText);
  };
  
  return (
    <Card className="assistant-message-processor border shadow-none mb-3">
      <CardContent className="pt-3 px-4">
        <div className="mb-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
            Assistant
          </span>
          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full ml-2">
            Web Service
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
        
        {/* Auto-fill button */}
        <div className="flex justify-end">
          <Button
            onClick={handleAutoFill}
            className={`${getColorClass()} text-white transition-all transform hover:scale-105`}
          >
            {buttonText}
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

WebServiceProcessor.displayName = 'WebServiceProcessor';