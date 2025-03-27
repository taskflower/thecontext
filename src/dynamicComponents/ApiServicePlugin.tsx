/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/plugins/ApiServicePlugin.tsx
import { useState, useEffect } from "react";
import { PluginComponentWithSchema } from "../modules/plugins/types";
import { Send, Loader2 } from "lucide-react";

import { PluginAuthAdapter } from "../services/PluginAuthAdapter";
import { LlmService } from "../services/LlmService";
import { AuthUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

// Define the structure of our plugin data
interface ApiServiceData {
  buttonText?: string;
  assistantMessage?: string;
  fillUserInput?: boolean;
  apiUrl?: string;
}

const ApiServicePlugin: PluginComponentWithSchema<ApiServiceData> = ({
  data,
  appContext,
}) => {
  // Define default values inside the component
  const defaultOptions = {
    buttonText: "Send Request",
    assistantMessage: "This is the message that will be sent to the API.",
    fillUserInput: false,
    apiUrl: "api/v1/services/chat/completion",
  };

  // Merge provided data with defaults
  const options: ApiServiceData = {
    ...defaultOptions,
    ...(data as ApiServiceData),
  };

  // Get auth context from the app if available
  const auth = useAuth();
  const enhancedAppContext = { ...appContext, authContext: auth };

  // Initialize auth adapter (tylko raz)
  const [authAdapter] = useState(
    () => new PluginAuthAdapter(enhancedAppContext)
  );

  // Usunięcie stanu dla LlmService - zamiast tego tworzymy funkcję do pozyskiwania świeżej instancji
  const getLlmService = () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    return new LlmService(authAdapter, {
      apiUrl: options.apiUrl,
      apiBaseUrl: apiBaseUrl,
    });
  };

  // State for handling API request
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [, setAuthAttempts] = useState(authAdapter.getAuthAttempts());

  // Get values from app context
  const currentNodeId = appContext?.currentNode?.id;
  const assistantMessage =
    appContext?.currentNode?.assistantMessage || options.assistantMessage;

  // Casting methods from appContext
  const { addNodeMessage, moveToNextNode } = (appContext || {}) as any;

  // Load user data when component mounts
  useEffect(() => {
    const loadAuth = async () => {
      setAuthLoading(true);
      try {
        // First try getting user from auth context
        if (auth?.currentUser) {
          setCurrentUser(auth.currentUser);
        } else {
          // Fallback to adapter
          const user = await authAdapter.getCurrentUser();
          setCurrentUser(user);
        }

        setAuthAttempts(authAdapter.getAuthAttempts());
      } catch (error) {
        console.error("Error loading auth:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuth();
  }, [auth, authAdapter]);

  // Function to call the API
  const callApi = async () => {
    if (!currentNodeId) return;

    setIsLoading(true);
    setApiResponse(null);
    setHasError(false);

    try {
      // Get current user ID or use anonymous
      const userId = currentUser?.uid || "anonymous";

      // Utworzenie nowej instancji LlmService za każdym razem, aby użyć aktualnego URL
      const llmService = getLlmService();

      // Dodanie logowania aby sprawdzić używany URL (opcjonalnie)
      console.log(`Sending request to: ${options.apiUrl}`);

      // Send request using LlmService
      const response = await llmService.sendRequest({
        message: assistantMessage || "",
        userId,
      });

      const formattedResponse = JSON.stringify(response.data, null, 2);
      setApiResponse(formattedResponse);

      if (
        response.success &&
        response.data?.success &&
        response.data?.data?.message?.content
      ) {
        const assistantContent = response.data.data.message.content;

        // Update user message with content from API if enabled
        if (options.fillUserInput && appContext?.updateNodeUserPrompt) {
          appContext.updateNodeUserPrompt(currentNodeId, assistantContent);
        }

        // Add the API response to the conversation
        if (addNodeMessage) {
          addNodeMessage(
            currentNodeId,
            `API Response:\n\`\`\`json\n${formattedResponse}\n\`\`\``
          );
        }

        // Move to next node if not filling user input
        if (!options.fillUserInput && moveToNextNode) {
          moveToNextNode(currentNodeId);
        }
      } else {
        setHasError(true);

        // Add warning to conversation
        if (addNodeMessage) {
          addNodeMessage(
            currentNodeId,
            "Warning: Could not extract content from API response."
          );
        }
      }
    } catch (error) {
      console.error("API error:", error);
      setApiResponse(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      setHasError(true);

      // Add error to conversation
      if (addNodeMessage) {
        addNodeMessage(
          currentNodeId,
          `API Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* API response (if any) */}
      {apiResponse && (
        <div
          className={`bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md border ${
            hasError
              ? "border-red-300 dark:border-red-800"
              : "border-gray-200 dark:border-gray-800"
          } overflow-auto max-h-60`}
        >
          <pre className="text-xs whitespace-pre-wrap">{apiResponse}</pre>
        </div>
      )}

      <div className="flex justify-between gap-4">
        {/* Auth Debug Information */}

        {/* API call button */}

        <button
          onClick={callApi}
          disabled={isLoading || authLoading}
          className={`flex-1 w-full px-4 py-2 rounded flex items-center text-white bg-blue-500 transition-colors ${
            isLoading || authLoading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-blue-600"
          }`}
        >
          {isLoading ? (
            <div className="py-3 flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="text-xs flex justify-between py-2 w-full items-center">
                {/* User Info */}
                <div className="text-left">
                  <strong>User:</strong>{" "}
                  <div>{currentUser ? currentUser.email : "Not logged in"}</div>
                </div>
                <div className="flex text-lg items-center">
                  {options.buttonText}
                  <Send className="ml-2 h-4 w-4" />
                </div>
              </div>
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
  apiUrl: "api/v1/services/chat/completion",
};

// Specify that this plugin should replace the assistant view
ApiServicePlugin.pluginSettings = {
  replaceHeader: true,
  // replaceAssistantView: true,
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
