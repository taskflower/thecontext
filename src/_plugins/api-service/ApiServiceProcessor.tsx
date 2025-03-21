// src/plugins/api-service/ApiServiceProcessor.tsx
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, Loader2, User } from "lucide-react";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { useWorkspaceContext } from "../../modules/context/hooks/useContext";
import { useAppStore } from "../../modules/store";
import { memo } from "react";
import { authService } from "../../services/authService";
import { useAuthState } from "../../hooks/useAuthState";

export const ApiServiceProcessor: React.FC = memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    isNodeProcessed, 
    markNodeAsProcessed,
    nextNode,
    updateUserMessage
  } = useFlowPlayer();
  
  const { processTemplate } = useWorkspaceContext();
  const { addToConversation } = useAppStore();
  const { user, backendUser } = useAuthState();
  
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
  const buttonText = options.button_text || "Send Request";
  const userIdValue = user?.uid || "user123";
  const assistantMessage = options.assistant_message || "This is the message that will be sent to the API.";
  const fillUserInput = options.fill_user_input || false;
  
  // Get color class for button
  const getColorClass = () => {
    if (isLoading) return "bg-gray-400 cursor-not-allowed";
    return "bg-blue-500 hover:bg-blue-600";
  };
  
  // Process message for display
  const displayMessage = currentNode.assistant
    ? processTemplate(currentNode.assistant)
    : "";
  
  // API call function
// Enhanced version of the API call function
const callApi = async () => {
  setIsLoading(true);
  setApiResponse(null);
  
  try {
    // Get authentication token
    const authToken = user ? await authService.getCurrentUserToken() : null;
    
    // Get API URL from environment variable
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const apiUrl = `${apiBaseUrl}/api/v1/services/chat/completion`;
    
    // Process assistant message for API request
    const processedAssistantMessage = currentNode.assistant 
      ? processTemplate(currentNode.assistant) 
      : processTemplate(assistantMessage);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
      },
      body: JSON.stringify({
        messages: [
          { role: "user", content: processedAssistantMessage }
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
    
    // Log response structure for debugging
    console.log("API response structure:", {
      hasSuccess: !!data?.success,
      hasData: !!data?.data,
      hasMessage: !!data?.data?.message,
      hasContent: !!data?.data?.message?.content,
      fillUserInputEnabled: fillUserInput
    });
    
    // Extract assistant message content if it exists in the response
    if (data?.success && data?.data?.message?.content) {
      const assistantContent = data.data.message.content;
      
      console.log("Extracted content:", assistantContent);
      
      // Always fill user input with content from API
      console.log("Filling user input with content");
      updateUserMessage(assistantContent);
      // Don't move to next node when filling input
    } else {
      console.warn("Could not extract content from API response:", data);
      
      // Add warning to conversation
      addToConversation({
        role: "assistant",
        message: "Warning: Could not extract assistant content from API response."
      });
      
      // Only move to next node if not filling user input
      if (!fillUserInput) {
        nextNode("API call completed");
      }
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
        
        {/* User information */}
        {user && (
          <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-800 mb-3">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Logged in as:</span>
            </div>
            <div className="mt-1 text-xs">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>User ID:</strong> {user.uid}</div>
              {backendUser && (
                <div className="mt-1">
                  <div><strong>Available Tokens:</strong> {backendUser.availableTokens}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
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