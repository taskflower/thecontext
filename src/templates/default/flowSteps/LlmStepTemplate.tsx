// src/templates/default/flowSteps/LlmStepTemplate.tsx
import React, { useEffect } from "react";
import { FlowStepProps } from "@/types";
import { useFlowStep } from "@/hooks"; // Usunięto useLLM

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  // Używamy zunifikowanego hooka useFlowStep, który łączy funkcjonalności
  // useLLM i poprzedniego useFlowStep
  const { 
    isLoading, 
    error, 
    responseData, 
    processedAssistantMessage,
    handlePrevious, 
    handleComplete,
    sendMessage
  } = useFlowStep({
    node,
    isFirstNode,
    isLastNode,
    onSubmit,
    onPrevious,
  });

  // Automatycznie wyślij zapytanie po załadowaniu komponentu
  useEffect(() => {
    if (node.attrs?.initialUserMessage) {
      // Zakładamy, że sendMessage jest dostępne w useFlowStep
      sendMessage(node.attrs.initialUserMessage);
    }
  }, [node.attrs?.initialUserMessage, sendMessage]);

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
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Przycisk wstecz/anuluj - uproszczona implementacja */}
              <button
                onClick={handlePrevious}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Anuluj" : "Wstecz"}
              </button>

              {/* Przycisk dalej/zakończ - uproszczona implementacja */}
              <button
                onClick={() => handleComplete(responseData)}
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