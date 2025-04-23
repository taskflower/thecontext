// src/templates/default/flowSteps/LlmQueryTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useLLM } from "@/hooks/useLLM";

const LlmQueryTemplate: React.FC<FlowStepProps> = ({ 
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
    processedInitialMessage
  } = useLLM({
    initialUserMessage: node.attrs?.initialUserMessage || "",
    assistantMessage: node.assistantMessage || "",
    systemMessage: node.attrs?.systemMessage || "",
    schemaPath: node.attrs?.schemaPath || "",
    autoStart: node.attrs?.autoStart || false,
    onDataSaved: (data) => {
      onSubmit(data);
    },
  });

  const [userInput, setUserInput] = React.useState("");

  const handleSubmit = () => {
    if (userInput.trim()) {
      sendMessage(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      {processedInitialMessage && (
        <div className="bg-green-50 p-4 rounded-lg mb-6">
          <p className="text-green-800">{processedInitialMessage}</p>
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
        <div className="bg-white border rounded-lg p-4 mb-6">
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

      {!node.attrs?.autoStart && (
        <div className="mb-6">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            placeholder="Wpisz swoją odpowiedź..."
            rows={4}
          />
          <button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className={`mt-2 px-4 py-2 rounded ${
              userInput.trim()
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Wyślij
          </button>
        </div>
      )}

      <div className="flex justify-between">
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

export default LlmQueryTemplate;