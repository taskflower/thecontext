// src/templates/default/flowSteps/LlmStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "@/types";
import { useFlowStep } from "@/hooks";

const LlmStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
  isFirstNode,
}) => {
  // Używamy zunifikowanego hooka useFlowStep, który zawiera
  // wszystkie funkcjonalności potrzebne do obsługi kroku LLM
  const { 
    isLoading, 
    error, 
    responseData, 
    processedAssistantMessage,
    debugInfo,
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

  // Funkcja renderująca informacje debugowania
  const renderDebugInfo = () => {
    if (!debugInfo || process.env.NODE_ENV === 'production') return null;
    
    return (
      <div className="mt-2 p-2 bg-gray-100 text-xs text-gray-500 rounded">
        <p>Debug: {debugInfo}</p>
        <button 
          className="text-xs underline text-blue-500 mt-1"
          onClick={() => console.log({
            node,
            context: useFlowStep.getState?.()?.data?.contexts || "Context not available"
          })}
        >
          Log Context
        </button>
      </div>
    );
  };

  return (
    <div className="my-4">
      <div className="border-0">
        <div className="w-full">
          {/* Wiadomość asystenta */}
          {processedAssistantMessage && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-gray-800">{processedAssistantMessage}</p>
            </div>
          )}

          {/* Loader podczas ładowania */}
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
              <p className="mt-3 text-gray-600">Analizuję dane...</p>
            </div>
          )}

          {/* Informacje diagnostyczne - tylko w trybie deweloperskim */}
          {renderDebugInfo()}

          {/* Komunikat błędu */}
          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-600">Wystąpił błąd: {error}</p>
              <button
                onClick={() => {
                  if (node.attrs?.initialUserMessage) {
                    const processed = node.attrs.initialUserMessage;
                    sendMessage(processed);
                  }
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Spróbuj ponownie
              </button>
            </div>
          )}

          {/* Przyciski nawigacji - widoczne tylko gdy mamy odpowiedź */}
          {responseData && (
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              {/* Przycisk wstecz/anuluj */}
              <button
                onClick={handlePrevious}
                className="px-5 py-3 rounded-md transition-colors text-base font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              >
                {isFirstNode ? "Anuluj" : "Wstecz"}
              </button>

              {/* Przycisk dalej/zakończ */}
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