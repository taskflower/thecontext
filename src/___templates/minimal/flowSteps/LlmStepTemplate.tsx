// src/templates/minimal/flowSteps/LlmStepTemplate.tsx
import React, { useEffect } from "react";
import { FlowStepProps } from "../../baseTemplate";
import { useLlmWithZod } from "@/hooks/useLLM";
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";


const LlmStepTemplate: React.FC<FlowStepProps> = ({ node, onSubmit, onPrevious, isLastNode }) => {
  const { sendMessage, isLoading, error, responseData, processedAssistantMessage } =
    useLlmWithZod({
      assistantMessage: node.assistantMessage || "",
      systemMessage: node.attrs?.includeSystemMessage ? useWorkspaceStore.getState().getCurrentScenario()?.systemMessage || "" : "",
      initialUserMessage: node.attrs?.initialUserMessage || "",
      schemaPath: node.attrs?.schemaPath || "",
      contextPath: node.contextPath,
      autoStart: true,
      onDataSaved: (data) => {
        onSubmit(data);
      },
    });

  useEffect(() => {
    if (node.attrs?.autoStart) sendMessage(node.attrs.initialUserMessage || "");
  }, []);

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-bold text-base text-gray-900">
          {node.label ? `Krok: ${node.label}` : 'Analiza AI'}
        </h3>
      </div>

      <div className="my-4">
        <div className="mt-6 space-y-5">
          {processedAssistantMessage && (
            <p className="text-base text-gray-700 mb-4">{processedAssistantMessage}</p>
          )}

          {isLoading && (
            <div className="flex items-center justify-center p-8 h-40 bg-blue-50 rounded-lg">
              <div className="relative flex flex-col items-center">
                {/* Ładna animowana ikona ładowania SVG */}
                <svg className="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4 text-sm font-medium text-gray-700">Analizuję dane...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-100">
              <p className="text-red-600">Wystąpił błąd: {error}</p>
            </div>
          )}

          {responseData && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-2">Wynik analizy:</h4>
              <div className="bg-white p-4 rounded-md overflow-auto max-h-80">
                {typeof responseData === 'object' ? (
                  Object.entries(responseData).map(([key, value]) => (
                    <div key={key} className="mb-3">
                      <h5 className="font-medium text-gray-800">{key}:</h5>
                      {Array.isArray(value) ? (
                        <ul className="list-disc pl-5 mt-1">
                          {value.map((item, i) => (
                            <li key={i} className="text-gray-700">{item}</li>
                          ))}
                        </ul>
                      ) : typeof value === 'object' && value !== null ? (
                        <pre className="bg-gray-50 p-2 rounded mt-1 text-sm overflow-auto">
                          {JSON.stringify(value, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-gray-700 mt-1">{String(value)}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">{String(responseData)}</p>
                )}
              </div>
            </div>
          )}

          {!isLoading && !responseData && !error && (
            <div className="text-center p-8 h-40 flex items-center justify-center">
              <p className="text-gray-500 italic">Oczekiwanie na wynik analizy AI...</p>
            </div>
          )}

          <div className="flex justify-between pt-4">
            <button
              onClick={onPrevious}
              disabled={isLoading}
              className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              Wstecz
            </button>

            {responseData && (
              <button
                onClick={() => onSubmit(responseData)}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
              >
                {isLastNode ? "Zakończ" : "Dalej"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LlmStepTemplate;