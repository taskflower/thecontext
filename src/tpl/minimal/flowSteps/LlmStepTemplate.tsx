// src/tpl/minimal/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useLLM } from "@/hooks/useLLM";
import { useNavigate, useParams } from "react-router-dom";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode
}) => {
  const navigate = useNavigate();
  const { application, workspace } = useParams();
  
  const {
    sendMessage,
    isLoading,
    error,
    responseData,
    processedAssistantMessage,
  } = useLLM({
    assistantMessage: node.assistantMessage || "",
    initialUserMessage: node.attrs?.initialUserMessage || "",
    schemaPath: node.attrs?.schemaPath || "",
    autoStart: true,
    onDataSaved: (data) => {
      // We'll handle submission separately to account for navigation
    },
  });

  // Handle back navigation based on whether it's the first node
  const handlePrevious = () => {
    if (isFirstNode) {
      // Navigate back to scenarios list
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/');
      }
    } else {
      // Use provided onPrevious handler
      onPrevious();
    }
  };
  
  // Handle completion of the flow
  const handleComplete = () => {
    if (!responseData) return;
    
    // Call onSubmit to save the data
    onSubmit(responseData);
    
    // If this is the last node, navigate back to scenarios
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      }
    }
  };

  return (
    <div className="my-4">
      <div className="border-0">
        <div className="w-full">
          {processedAssistantMessage && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-800">{processedAssistantMessage}</p>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600">Wystąpił błąd: {error}</p>
            </div>
          )}

          {responseData && (
            <div className="bg-white border border-gray-200 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Wyniki analizy</h3>
              <div className="space-y-3">
                {Object.entries(responseData).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-200 pb-3 last:border-b-0">
                    <span className="font-medium text-gray-900">{key}:</span>
                    {Array.isArray(value) ? (
                      <ul className="list-disc list-inside mt-2">
                        {(value as string[]).map((item, index) => (
                          <li key={index} className="text-gray-600">
                            {item}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="ml-2 text-gray-600">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : String(value)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {responseData && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Back button (shown on all nodes) */}
              <button
                onClick={handlePrevious}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Anuluj" : "Wstecz"}
              </button>

              {/* Continue button */}
              <button
                onClick={handleComplete}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium flex-grow bg-gray-900 text-white hover:bg-gray-800"
              >
                {isLastNode ? "Zakończ" : "Dalej"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LlmStepTemplate;