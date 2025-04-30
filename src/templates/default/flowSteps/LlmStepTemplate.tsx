// src/templates/default/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useFlow } from "@/hooks";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  // Użyj ujednoliconego hooka useFlow
  const { 
    isLoading, 
    error, 
    responseData, 
    processedAssistantMessage,
    debugInfo,
    handleBack, 
    handleNext,
    sendMessage
  } = useFlow({
    node,
    onSubmit,
    onPrevious,
    isFirstNode,
    isLastNode,
  });

  return (
    <div className="my-4">
      <div className="border-0">
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

          {/* Diagnostic information */}
          {debugInfo && (
            <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-500 rounded">
              <p>Debug: {debugInfo}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600">An error occurred: {error}</p>
              <button
                onClick={() => {
                  if (node.attrs?.initialUserMessage) {
                    const processed = node.attrs.initialUserMessage;
                    sendMessage(processed);
                  }
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Try again
              </button>
            </div>
          )}

          {/* Display LLM response if available */}
          {responseData && !error && !isLoading && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Analysis result:</h3>
              <pre className="bg-gray-50 p-3 rounded overflow-auto text-sm whitespace-pre-wrap">
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
          )}

          {/* Navigation buttons */}
          {responseData && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Back/cancel button */}
              <button
                onClick={handleBack}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Cancel" : "Back"}
              </button>

              {/* Next/finish button */}
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
    </div>
  );
};

export default LlmStepTemplate;