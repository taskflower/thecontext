// src/templates/minimal/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useLLM } from "@/hooks/useLLM";

const LlmStepTemplate: React.FC<FlowStepProps> = ({ 
  node, 
  onSubmit, 
  onPrevious, 
  isLastNode 
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
    <div className="p-6 max-w-2xl mx-auto">
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 p-4 rounded-lg text-red-800">
          <p>Wystąpił błąd: {error}</p>
        </div>
      )}

      {responseData && (
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Wyniki analizy</h3>
          <div className="space-y-2">
            {Object.entries(responseData).map(([key, value]) => (
              <div key={key} className="border-b pb-2 last:border-b-0">
                <span className="font-medium">{key}:</span>
                {Array.isArray(value) ? (
                  <ul className="list-disc list-inside">
                    {(value as string[]).map((item, index) => (
                      <li key={index} className="text-gray-700">{item}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="ml-2 text-gray-700">
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2) 
                      : String(value)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-8">
        <button 
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Wstecz
        </button>
        {responseData && (
          <button 
            onClick={() => onSubmit(responseData)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isLastNode ? 'Zakończ' : 'Dalej'}
          </button>
        )}
      </div>
    </div>
  );
};

export default LlmStepTemplate;