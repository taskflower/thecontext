// src/tpl/minimal/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useLLM } from "@/hooks/useLLM";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
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
      onSubmit(data);
    },
  });

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
            <div className="mt-6">
              <button
                onClick={() => onSubmit(responseData)}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium w-full bg-gray-900 text-white hover:bg-gray-800"
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