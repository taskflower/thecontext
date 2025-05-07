// src/templates/default/flowSteps/LlmStep.tsx
import React, { useState, useEffect } from "react";
import { FlowStepProps } from "@/types";
import { useFlow } from "@/hooks";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  const { 
    isLoading, 
    error, 
    responseData, 
    rawResponseData,
    processedAssistantMessage,
    debugInfo,
    handleBack, 
    handleNext,
    sendMessage,
    schema,
    currentNode
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  // Local state for retries and manual input
  const [userMessage, setUserMessage] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputError, setManualInputError] = useState<string | null>(null);

  // Extract schema from initialUserMessage if missing
  const extractSchema = () => {
    if (schema) return schema;
    
    // Try to extract schema from initialUserMessage
    if (currentNode?.attrs?.initialUserMessage) {
      const message = currentNode.attrs.initialUserMessage;
      const schemaMatch = message.match(/```json\s*([\s\S]*?)```/);
      
      if (schemaMatch && schemaMatch[1]) {
        try {
          return JSON.parse(schemaMatch[1]);
        } catch (e) {
          console.error("Failed to parse schema from message:", e);
        }
      }
    }
    
    return null;
  };
  
  const actualSchema = extractSchema();

  // Function to handle manual JSON input
  const handleManualSubmit = () => {
    try {
      const parsedData = JSON.parse(manualInput);
      handleNext(parsedData);
    } catch (err) {
      setManualInputError("Invalid JSON format. Please check your input.");
    }
  };

  // Function to handle message retry
  const handleRetry = () => {
    if (node.attrs?.initialUserMessage) {
      sendMessage(node.attrs.initialUserMessage);
    }
  };

  // Function to handle custom message
  const handleCustomMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userMessage.trim()) {
      sendMessage(userMessage);
    }
  };

  // Determine if we have a response and if it's valid
  const hasJsonResponse = responseData && !error && !isLoading;
  const hasRawResponseButNoJson = rawResponseData && !responseData && !isLoading;
  
  // POPRAWIONE: Pokazuj błąd tylko gdy faktycznie jest błąd API
  const hasError = !!error;

  // Extract expected format from the prompt
  const getExpectedFormat = () => {
    if (actualSchema) {
      return JSON.stringify(actualSchema, null, 2);
    }
    
    // If we have a raw response but no schema, try to infer from it
    if (rawResponseData && !responseData) {
      // Extract any JSON code blocks
      const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/g;
      const matches = Array.from(rawResponseData.matchAll(jsonBlockRegex));
      if (matches.length > 0) {
        return matches[0][1].trim();
      }
    }

    // Extract expected format from initialUserMessage
    if (currentNode?.attrs?.initialUserMessage) {
      const message = currentNode.attrs.initialUserMessage;
      // Look for description of expected format in the initialUserMessage
      if (message.includes("JSON") || message.includes("json")) {
        const formatDesc = message.split("Zwróć JSON z polami:")[1] || 
                         message.split("Return JSON with fields:")[1] || 
                         message.split("response in JSON format with:")[1];
        
        if (formatDesc) {
          return formatDesc.trim();
        }
      }
    }
    
    return "Unable to determine expected format. Please provide valid JSON data.";
  };

  return (
    <div className="my-4">
      <div className="w-full">
        {/* Assistant message */}
        {processedAssistantMessage && (
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-gray-800">{processedAssistantMessage}</p>
          </div>
        )}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex flex-col justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="mt-3 text-gray-600">
              <strong>Analyzing data...</strong>
            </p>
          </div>
        )}

        {/* Debug info */}
        {debugInfo && (
          <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-500 rounded">
            <p>Debug: {debugInfo}</p>
          </div>
        )}

        {/* Error message and retry options */}
        {hasError && (
          <div className="border p-4 rounded-lg mb-4">
            <p className="text-red-600 mb-2">
              {error || "Couldn't generate a valid response. The model may not have access to the requested information."}
            </p>
            
            <div className="flex flex-col space-y-4 mt-3">
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try again
              </button>
              
              <button
                onClick={() => setShowManualInput(!showManualInput)}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                {showManualInput ? "Hide manual entry" : "Enter data manually"}
              </button>
              
              {!showManualInput && (
                <div className="mt-3 border-t border-red-200 pt-3">
                  <p className="text-gray-700 mb-2">Or try with a custom message:</p>
                  <form onSubmit={handleCustomMessageSubmit} className="space-y-2">
                    <textarea
                      value={userMessage}
                      onChange={(e) => setUserMessage(e.target.value)}
                      className="w-full border border-gray-300 rounded p-2 text-sm"
                      rows={3}
                      placeholder="Enter your custom prompt here..."
                    />
                    <button
                      type="submit"
                      disabled={userMessage.trim() === "" || isLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                      Send custom message
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Manual data entry form */}
        {showManualInput && (
          <div className="border border-gray-300 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Manual Data Entry:</h3>
            <p className="text-sm text-gray-600 mb-3">
              Enter JSON data in the format expected by the next step:
            </p>
            
            <div className="mb-4">
              <p className="text-sm font-medium mb-1">Expected Format:</p>
              <pre className="bg-gray-50 p-3 rounded overflow-auto text-xs whitespace-pre-wrap border border-gray-200">
                {getExpectedFormat()}
              </pre>
              
              {currentNode?.contextPath && (
                <p className="text-xs text-gray-500 mt-1">
                  Data will be stored at context path: {currentNode.contextPath}
                </p>
              )}
            </div>
            
            <textarea
              value={manualInput}
              onChange={(e) => {
                setManualInput(e.target.value);
                setManualInputError(null);
              }}
              className="w-full border border-gray-300 rounded p-2 text-sm font-mono"
              rows={8}
              placeholder='{"example": "Enter your JSON here"}'
            />
            
            {manualInputError && (
              <p className="text-red-600 text-sm mt-1">{manualInputError}</p>
            )}
            
            <div className="flex justify-end mt-3">
              <button
                onClick={handleManualSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Submit manually
              </button>
            </div>
          </div>
        )}

        {/* JSON Response data */}
        {hasJsonResponse && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Analysis result:</h3>
            <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm whitespace-pre-wrap">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}

        {/* Raw Response (non-JSON) */}
        {hasRawResponseButNoJson && (
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Raw Response:</h3>
              
              <button
                onClick={() => setShowManualInput(true)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Enter JSON manually
              </button>
            </div>
            
            <div className="bg-gray-50 p-3 rounded overflow-auto text-sm">
              <pre className="whitespace-pre-line">{rawResponseData}</pre>
            </div>
            
            <div className="mt-3 text-sm text-gray-600">
              <p>
                This response is not in the expected JSON format. You can either:
              </p>
              <ul className="list-disc ml-5 mt-2">
                <li>Click "Enter JSON manually" to provide the required data</li>
                <li>Click "Try again" to request a new response</li>
              </ul>
            </div>
          </div>
        )}

        {/* Navigation buttons for JSON response */}
        {hasJsonResponse && (
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleBack}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            >
              {isFirstNode ? "Cancel" : "Back"}
            </button>

            <button
              onClick={() => handleNext(responseData)}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow bg-gray-900 text-white hover:bg-gray-800"
            >
              {isLastNode ? "Finish" : "Next"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LlmStepTemplate;