// src/templates/flowSteps/LlmQueryTemplate.tsx
import React, { useState, useEffect } from "react";
import { FlowStepProps } from "template-registry-module";
import { useAuth } from "@/hooks/useAuth";
import {
  NodeData,
  Scenario,
  ContextItem,
} from "@/../raw_modules/revertcontext-nodes-module/src";

// Extended interface for FlowStepProps that includes scenario and extended node
interface ExtendedFlowStepProps extends Omit<FlowStepProps, "node"> {
  node: NodeData;
  scenario?: Scenario;
  contextItems?: ContextItem[];
}

const LlmQueryTemplate: React.FC<ExtendedFlowStepProps> = ({
  node,
  scenario,
  onSubmit,
  onPrevious,
  isLastNode,
  contextItems = [],
}) => {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, jwtToken } = useAuth(); // Use jwtToken directly instead of getToken()

  // We only need to check auth status once when the component mounts
  // We no longer need to continuously check or store debug info about the token

  const sendMessageToGemini = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Use the existing jwtToken from useAuth() instead of calling getToken() every time
      if (!jwtToken) {
        throw new Error(
          "Authorization token unavailable. Please log in again."
        );
      }

      if (!user) {
        throw new Error("User is not logged in. Please log in again.");
      }

      // Prepare messages to send in the required order
      const messages = [];

      // 1. Add system message if the node has includeSystemMessage flag set
      // and scenario has a defined system message
      if (node.includeSystemMessage && scenario?.systemMessage) {
        messages.push({
          role: "system",
          content: scenario.systemMessage,
        });
      }

      // 2. Check if we have initial user message
      if (node.initialUserMessage) {
        // If we have initialUserMessage, use it as the first user message
        console.log("Using initialUserMessage:", node.initialUserMessage);
        messages.push({
          role: "user",
          content: node.initialUserMessage,
        });

        // If we also have an assistant message, add it after initialUserMessage
        if (node.assistantMessage && node.assistantMessage.trim() !== "") {
          messages.push({
            role: "assistant",
            content: node.assistantMessage,
          });
        }
      } else {
        // If we don't have initialUserMessage
        console.log("No initialUserMessage present");

        // We DON'T add any initial message - according to requirements
        // The conversation starts directly with the current user message
        // In this case, we don't add previous context, even if assistantMessage exists
      }

      // 3. Add the current user message
      messages.push({
        role: "user",
        content: message,
      });

      console.log("Prepared messages:", messages);

      // Format data according to the required structure
      const payload = {
        messages: messages,
        userId: user.uid,
      };

      // Send request to Gemini API with JWT token in Authorization header
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL
        }/api/v1/services/gemini/chat/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwtToken}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Response error:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error?.message ||
              `API request failed with error: ${response.status}`
          );
        } catch (e) {
          // If we can't parse JSON, use raw text
          throw new Error(
            `API request failed with error: ${
              response.status
            } - ${errorText.substring(0, 100)}...`
          );
        }
      }

      const responseData = await response.json();
      console.log("Response data:", responseData);

      // Pass both user input and AI response to the onSubmit handler
      onSubmit(
        JSON.stringify({
          userInput: message,
          aiResponse: responseData,
        })
      );

      // Clear input field
      setUserInput("");
    } catch (err) {
      console.error("Full error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (userInput.trim() === "") return;
    sendMessageToGemini(userInput);
  };

  return (
    <div className="space-y-4">
      {node.includeSystemMessage && scenario?.systemMessage && (
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-amber-500"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">
                System Message
              </h3>
              <p className="text-xs text-amber-700">{scenario.systemMessage}</p>
            </div>
          </div>
        </div>
      )}

      {node.initialUserMessage && (
        <div className="bg-green-50 p-3 rounded-lg border border-green-100">
          <div className="flex items-start space-x-3">
            <div className="bg-green-100 p-2 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-green-500"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-green-800 mb-1">
                Initial User Message
              </h3>
              <p className="text-xs text-green-700">
                {node.initialUserMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-blue-500"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">AI Assistant</h2>
            <p className="text-gray-700">
              {node.assistantMessage || "How can I help you?"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Ask the AI assistant..."
        />

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            Error: {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || userInput.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Processing...</span>
              </>
            ) : (
              <span>{isLastNode ? "Finish" : "Send and Continue"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlmQueryTemplate;
