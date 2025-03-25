/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { PluginComponentProps } from "../modules/plugins/types";
import { Send, Loader2 } from "lucide-react";

import { PluginAuthAdapter } from "../services/PluginAuthAdapter";
import { LlmService } from "../services/LlmService";
import { AuthUser } from "../services/authService";

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
    apiUrl: "api/v1/services/chat/completion",
  };

  // Merge provided data with defaults
  const options: ApiServiceData = {
    ...defaultOptions,
    ...(data as ApiServiceData),
  };

  // Initialize services - użyj zmiennych środowiskowych do konfiguracji
  const [authAdapter] = useState(() => new PluginAuthAdapter(appContext));
  const [llmService] = useState(() => {
    // Priorytetowo używaj VITE_API_URL z zmiennych środowiskowych
    const apiBaseUrl = import.meta.env.VITE_API_URL;
    return new LlmService(authAdapter, {
      apiUrl: options.apiUrl,
      apiBaseUrl: apiBaseUrl,
    });
  });

  // State for handling API request
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [hasError, setHasError] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [, setAuthToken] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authAttempts, setAuthAttempts] = useState(
    authAdapter.getAuthAttempts()
  );

  // Get values from app context
  const currentNodeId = appContext?.currentNode?.id;
  const assistantMessage =
    appContext?.currentNode?.assistantMessage || options.assistantMessage;

  // Rzutowanie metod z appContext (które nie są zdefiniowane w typie)
  const { addNodeMessage, moveToNextNode } = (appContext || {}) as any;

  // Load user and token when component mounts
  useEffect(() => {
    const loadAuth = async () => {
      setAuthLoading(true);
      try {
        const user = await authAdapter.getCurrentUser();
        setCurrentUser(user);

        const token = await authAdapter.getCurrentUserToken();
        setAuthToken(token);

        setAuthAttempts(authAdapter.getAuthAttempts());
      } catch (error) {
        console.error("Error loading auth:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuth();
  }, [authAdapter]);

  // Function to call the API
  const callApi = async () => {
    if (!currentNodeId) return;

    setIsLoading(true);
    setApiResponse(null);
    setHasError(false);

    try {
      // Get current user ID from the loaded user
      const userId = currentUser?.uid || "anonymous";

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
      <div className="text-xs bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-800">
        {/* Auth Attempts */}
        <strong>Authentication Attempts:</strong>
        {authAttempts.length === 0 ? (
          <div className="italic mt-1">No authentication attempts made yet</div>
        ) : (
          <ul className="list-disc pl-4 mt-1">
            {authAttempts.map((attempt, index) => (
              <li
                key={index}
                className={attempt.success ? "text-green-600" : "text-red-600"}
              >
                {attempt.method}:{" "}
                {attempt.success ? "Success" : `Failed - ${attempt.error}`}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Assistant message display */}
      <div className="p-4 rounded-md border min-h-[100px] bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        {assistantMessage ? (
          <p className="whitespace-pre-wrap text-sm">{assistantMessage}</p>
        ) : (
          <p className="text-muted-foreground italic text-sm">
            This node has no assistant message.
          </p>
        )}
      </div>

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

      {/* API call button */}
      <div className="flex justify-end">
        <button
          onClick={callApi}
          disabled={isLoading || authLoading}
          className={`px-4 py-2 rounded flex items-center text-white bg-blue-500 transition-colors ${
            isLoading || authLoading
              ? "opacity-70 cursor-not-allowed"
              : "hover:bg-blue-600"
          }`}
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
  apiUrl: "api/v1/services/chat/completion",
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
