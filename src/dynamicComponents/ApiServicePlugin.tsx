// src/dynamicComponents/ApiServicePlugin.tsx
import React, { useState, useEffect } from "react";
import { PluginComponentProps } from "../modules/plugins/types";
import { Send, Loader2, User } from "lucide-react";

// Add type definition for window.authService
declare global {
  interface Window {
    authService?: {
      getCurrentUserToken: () => Promise<string>;
    };
    env?: {
      API_URL?: string;
    };
  }
}

// Define the structure of our plugin data
interface ApiServiceData {
  buttonText?: string;
  assistantMessage?: string;
  fillUserInput?: boolean;
  apiUrl?: string;
}

const ApiServicePlugin: React.FC<PluginComponentProps> = ({
  data,
  appContext,
}) => {
  // Define default values inside the component to avoid ambient context issues
  const defaultOptions = {
    buttonText: "Send Request",
    assistantMessage: "This is the message that will be sent to the API.",
    fillUserInput: false,
    apiUrl: "api/v1/services/chat/completion"
  };

  // Merge provided data with defaults
  const options: ApiServiceData = {
    ...defaultOptions,
    ...(data as ApiServiceData),
  };

  // State for handling API request
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // Get values from app context
  const currentNodeId = appContext?.currentNode?.id;
  const assistantMessage = appContext?.currentNode?.assistantMessage || options.assistantMessage;
  const user = appContext?.user;
  
  // Debug state for auth attempts
  const [authAttempts, setAuthAttempts] = useState<{
    method: string;
    success: boolean;
    error?: string;
  }[]>([]);

  // Get auth token on mount
  useEffect(() => {
    const getToken = async () => {
      const attempts = [];
      
      // Try with appContext.authService
      if (appContext?.authService?.getCurrentUserToken) {
        try {
          const token = await appContext.authService.getCurrentUserToken();
          if (token) {
            setAuthToken(token);
            attempts.push({ method: 'appContext.authService', success: true });
            setAuthAttempts(attempts);
            return; // Exit if successful
          } else {
            attempts.push({ 
              method: 'appContext.authService', 
              success: false, 
              error: 'Token was null'
            });
          }
        } catch (error) {
          attempts.push({ 
            method: 'appContext.authService', 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      // Try with appContext.user.getIdToken
      if (appContext?.user?.getIdToken) {
        try {
          const token = await appContext.user.getIdToken();
          if (token) {
            setAuthToken(token);
            attempts.push({ method: 'appContext.user.getIdToken', success: true });
            setAuthAttempts(attempts);
            return; // Exit if successful
          } else {
            attempts.push({ 
              method: 'appContext.user.getIdToken', 
              success: false, 
              error: 'Token was null'
            });
          }
        } catch (error) {
          attempts.push({ 
            method: 'appContext.user.getIdToken', 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      // Try with window.authService
      if (window.authService?.getCurrentUserToken) {
        try {
          const token = await window.authService.getCurrentUserToken();
          if (token) {
            setAuthToken(token);
            attempts.push({ method: 'window.authService', success: true });
            setAuthAttempts(attempts);
            return; // Exit if successful
          } else {
            attempts.push({ 
              method: 'window.authService', 
              success: false, 
              error: 'Token was null'
            });
          }
        } catch (error) {
          attempts.push({ 
            method: 'window.authService', 
            success: false, 
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      // Log all attempts and set in state
      console.error("All authentication methods failed:", attempts);
      setAuthAttempts(attempts);
    };
    
    getToken();
  }, [appContext]);

  // Function to call the API
  const callApi = async () => {
    if (!currentNodeId) return;
    
    setIsLoading(true);
    setApiResponse(null);
    setHasError(false);
    
    try {
      // Use the token we retrieved in the useEffect hook
      // If we don't have it yet, try to get it again
      let currentToken = authToken;
      if (!currentToken) {
        try {
          if (appContext?.authService?.getCurrentUserToken) {
            currentToken = await appContext.authService.getCurrentUserToken();
          } else if (appContext?.user?.getIdToken) {
            currentToken = await appContext.user.getIdToken();
          } else if (window.authService?.getCurrentUserToken) {
            currentToken = await window.authService.getCurrentUserToken();
          }
        } catch (error) {
          console.error("Error getting auth token:", error);
        }
      }
      
      // Log token availability for debugging (remove in production)
      console.log('Auth token available:', !!currentToken);
      
      // Get API URL from options or environment variable
      const apiBaseUrl = (window as any).env?.API_URL || import.meta.env?.VITE_API_URL || 'http://localhost:3000';
      const apiUrl = `${apiBaseUrl}/${options.apiUrl}`;
      
      console.log('Making API request to:', apiUrl);
      
      // Create headers object with authorization if token is available
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Only add Authorization header if we have a token
      if (currentToken) {
        headers['Authorization'] = `Bearer ${currentToken}`;
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          messages: [
            { role: "user", content: assistantMessage }
          ],
          userId: user?.id || user?.uid || "anonymous"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedResponse = JSON.stringify(data, null, 2);
      setApiResponse(formattedResponse);
      
      // Extract assistant content if it exists in the response
      if (data?.success && data?.data?.message?.content) {
        const assistantContent = data.data.message.content;
        
        // Update user message with content from API if enabled
        if (options.fillUserInput && appContext?.updateNodeUserPrompt) {
          appContext.updateNodeUserPrompt(currentNodeId, assistantContent);
        }
        
        // Add the API response to the conversation
        if (appContext?.addNodeMessage) {
          appContext.addNodeMessage(currentNodeId, `API Response:\n\`\`\`json\n${formattedResponse}\n\`\`\``);
        }
        
        // Move to next node if not filling user input
        if (!options.fillUserInput && appContext?.moveToNextNode) {
          appContext.moveToNextNode(currentNodeId);
        }
      } else {
        setHasError(true);
        
        // Add warning to conversation
        if (appContext?.addNodeMessage) {
          appContext.addNodeMessage(currentNodeId, "Warning: Could not extract content from API response.");
        }
      }
    } catch (error) {
      console.error("API error:", error);
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setHasError(true);
      
      // Add error to conversation
      if (appContext?.addNodeMessage) {
        appContext.addNodeMessage(currentNodeId, `API Error: ${error instanceof Error ? error.message : String(error)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-2">
      {/* Header with labels */}
      <div className="flex gap-2">
        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
          Assistant
        </span>
        <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full">
          API Service
        </span>
      </div>
      
      {/* Auth Debug Information */}
      <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-800">
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
          <span className="text-sm font-medium">Authentication Status:</span>
        </div>
        
        {/* Display whether we have a user object or not */}
        <div className="mt-2 text-xs">
          <div className="mb-1">
            <strong>User Object:</strong> {user ? "Available ✓" : "Not available ✗"}
          </div>
          
          {/* If we have a user, display its details */}
          {user && (
            <>
              <div><strong>Email:</strong> {user.email || "Not available"}</div>
              <div><strong>User ID:</strong> {user.id || user.uid || "Not available"}</div>
              <div><strong>User Keys:</strong> {Object.keys(user).join(", ")}</div>
              {(user.tokens || user.availableTokens) && (
                <div><strong>Available Tokens:</strong> {user.tokens || user.availableTokens}</div>
              )}
            </>
          )}
          
          {/* Auth Token Status */}
          <div className="mt-2">
            <strong>Auth Token:</strong> {authToken ? "Available ✓" : "Not available ✗"}</div>
            {authToken && (
              <div className="text-xs opacity-60 truncate w-full mt-1">
                Token Preview: {authToken.substring(0, 20)}...
              </div>
            )}
          
          {/* Available Auth Methods */}
          <div className="mt-2">
            <strong>Available Auth Methods:</strong>
            <ul className="list-disc pl-4 mt-1">
              <li>appContext.authService: {appContext?.authService?.getCurrentUserToken ? "Available ✓" : "Not available ✗"}</li>
              <li>appContext.user.getIdToken: {appContext?.user?.getIdToken ? "Available ✓" : "Not available ✗"}</li>
              <li>window.authService: {typeof window !== 'undefined' && window.authService ? "Available ✓" : "Not available ✗"}</li>
            </ul>
          </div>
          
          {/* Auth Attempts */}
          <div className="mt-2">
            <strong>Authentication Attempts:</strong>
            {authAttempts.length === 0 ? (
              <div className="italic mt-1">No authentication attempts made yet</div>
            ) : (
              <ul className="list-disc pl-4 mt-1">
                {authAttempts.map((attempt, index) => (
                  <li key={index} className={attempt.success ? "text-green-600" : "text-red-600"}>
                    {attempt.method}: {attempt.success ? "Success" : `Failed - ${attempt.error}`}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      
      {/* Assistant message display */}
      <div className="p-4 rounded-md border min-h-[100px] bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        {assistantMessage ? (
          <p className="whitespace-pre-wrap text-sm">{assistantMessage}</p>
        ) : (
          <p className="text-muted-foreground italic text-sm">This node has no assistant message.</p>
        )}
      </div>
      
      {/* API response (if any) */}
      {apiResponse && (
        <div className={`bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md border ${hasError ? 'border-red-300 dark:border-red-800' : 'border-gray-200 dark:border-gray-800'} overflow-auto max-h-60`}>
          <pre className="text-xs whitespace-pre-wrap">{apiResponse}</pre>
        </div>
      )}
      
      {/* API call button */}
      <div className="flex justify-end">
        <button
          onClick={callApi}
          disabled={isLoading}
          className={`px-4 py-2 rounded flex items-center text-white bg-blue-500 transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-600'}`}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              {options.buttonText}
              <Send className="ml-2 h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Create a stable reference for default options for the schema
const schemaDefaults = {
  buttonText: "Send Request",
  assistantMessage: "This is the message that will be sent to the API.",
  fillUserInput: false,
  apiUrl: "api/v1/services/chat/completion"
};

// Specify that this plugin should replace the assistant view
ApiServicePlugin.pluginSettings = {
  replaceAssistantView: true,
};

// Add options schema for the plugin editor
ApiServicePlugin.optionsSchema = {
  buttonText: {
    type: "string",
    label: "Button Text",
    default: schemaDefaults.buttonText,
    description: "Text to display on the API call button",
  },
  assistantMessage: {
    type: "string",
    label: "Default Assistant Message",
    default: schemaDefaults.assistantMessage,
    description: "Default message to send if node has no assistant message",
  },
  fillUserInput: {
    type: "boolean",
    label: "Fill User Input",
    default: schemaDefaults.fillUserInput,
    description: "Fill the user input with API response content",
  },
  apiUrl: {
    type: "string",
    label: "API Endpoint Path",
    default: schemaDefaults.apiUrl,
    description: "Path to the API endpoint (appended to API base URL)",
  },
};

export default ApiServicePlugin;