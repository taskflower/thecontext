// src/plugins/api-service/ApiServiceProcessor.tsx
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { useWorkspaceContext } from "../../modules/context/hooks/useContext";
import { useAppStore } from "../../modules/store";
import { memo } from "react";

export const ApiServiceProcessor: React.FC = memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    isNodeProcessed, 
    markNodeAsProcessed,
    nextNode
  } = useFlowPlayer();
  
  const { processTemplate } = useWorkspaceContext();
  const { addToConversation } = useAppStore();
  
  // State management
  const processedNodeRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  
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
  const options = currentNode.plugin === "api-service" && currentNode.pluginOptions
    ? currentNode.pluginOptions["api-service"] || {}
    : {};
  
  // Get plugin settings
  const buttonText = options.button_text || "Send API Request";
  const userIdValue = options.user_id || "user123";
  const messageContent = options.message_content || "Hello!";
  const buttonColor = options.button_color || "blue";
  
  // Get color class based on selected color
  const getColorClass = () => {
    if (isLoading) return "bg-gray-400 cursor-not-allowed";
    
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
  
  // API call function
  const callApi = async () => {
    setIsLoading(true);
    setApiResponse(null);
    
    try {
      // Get API URL from environment variable
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const apiUrl = `${apiBaseUrl}/api/v1/services/chat/completion`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: messageContent }
          ],
          userId: userIdValue
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      setApiResponse(JSON.stringify(data, null, 2));
      
      // Add response to conversation
      addToConversation({
        role: "assistant",
        message: `API Response:\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\``
      });
      
      // Move to next node optionally
      if (options.auto_progress) {
        nextNode("API call completed");
      }
    } catch (error) {
      console.error("API error:", error);
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add error to conversation
      addToConversation({
        role: "assistant",
        message: `API Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="assistant-message-processor border shadow-none mb-3">
      <CardContent className="pt-3 px-4">
        <div className="mb-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
            Assistant
          </span>
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full ml-2">
            API Service
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
        
        {/* API response (if any) */}
        {apiResponse && (
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md border border-gray-200 dark:border-gray-800 mb-3 overflow-auto max-h-60">
            <pre className="text-xs whitespace-pre-wrap">{apiResponse}</pre>
          </div>
        )}
        
        {/* API call button */}
        <div className="flex justify-end">
          <Button
            onClick={callApi}
            disabled={isLoading}
            className={`${getColorClass()} text-white transition-all`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {buttonText}
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

ApiServiceProcessor.displayName = 'ApiServiceProcessor';