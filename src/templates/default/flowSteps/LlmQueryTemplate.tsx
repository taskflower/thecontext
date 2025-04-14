// src/templates/default/flowSteps/LlmQueryTemplate.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useChat } from '@/hooks/useChat';
import { useAppStore } from '@/lib/store';

// --- UI Components ---
const LoadingSpinner: React.FC = () => <div className="p-4 my-2 text-center text-gray-500">Ładowanie odpowiedzi AI...</div>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <div className="p-3 my-2 text-red-700 bg-red-100 border border-red-300 rounded">{message}</div>;
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => <button {...props} className={`px-4 py-2 rounded font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 ${props.className}`} />;
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => <textarea {...props} className={`w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`} />;

export const LlmQueryTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
}) => {
  // Input validation
  if (!node) {
    console.error("[LlmQueryTemplate] Render cancelled: Node data is missing.");
    return <ErrorMessage message="Błąd krytyczny: Dane węzła (node) nie zostały załadowane." />;
  }

  const [userInput, setUserInput] = useState('');
  const { getCurrentScenario } = useAppStore();
  
  // --- Get config data from node and scenario ---
  const currentScenario = getCurrentScenario();
  const attrs = node?.attrs || {};
  const autoStart = attrs.autoStart === true;
  const includeSystemMessage = attrs.includeSystemMessage === true;
  const systemMessageContent = currentScenario?.systemMessage || '';
  const initialUserMessage = attrs.initialUserMessage || '';

  // Wykorzystanie rozszerzonego hooka useChat z całą logiką biznesową
  const { 
    sendMessage, 
    isLoading, 
    error, 
    debugInfo,
    responseData,
    processedAssistantMessage,
  } = useChat({
    includeSystemMessage,
    systemMessage: systemMessageContent,
    initialUserMessage,
    assistantMessage: node.assistantMessage || '',
    contextPath: node.contextPath,
    llmSchemaPath: attrs.llmSchemaPath,
    autoStart,
    onDataSaved: (data) => {
      console.log("[LlmQueryTemplate] Data saved callback:", data);
      if (data) {
        onSubmit(data);
        setUserInput('');
      }
    }
  });

  // Handle user input submission
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    sendMessage(userInput);
  };

  console.log(attrs);
  

  // Render the component (tylko UI)
  return (
    <div className="p-4 space-y-4 bg-white shadow rounded-lg">
      {/* Initial User Message Display */}
      {initialUserMessage && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Wiadomość początkowa:</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{initialUserMessage}</p>
        </div>
      )}
      
      {/* Assistant message */}
      {processedAssistantMessage && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p className="text-gray-800 whitespace-pre-wrap">{processedAssistantMessage}</p>
        </div>
      )}
      
      {/* Status messages */}
      {!processedAssistantMessage && !autoStart && (
        <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded text-sm">
          Brak wiadomości asystenta do wyświetlenia. Wpisz swoją odpowiedź poniżej.
        </div>
      )}
      
      {!processedAssistantMessage && autoStart && !isLoading && !error && !responseData && (
        <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-sm">
          Trwa automatyczne przetwarzanie (brak wiadomości asystenta do wyświetlenia w tym kroku).
        </div>
      )}
      
      {/* Debug info (optional) */}
      {debugInfo && (
        <div className="mb-4 p-2 bg-gray-100 border border-gray-300 rounded text-xs text-gray-600">
          <p>Debug: {debugInfo}</p>
        </div>
      )}
      
      {/* Display errors */}
      {error && <ErrorMessage message={`Błąd API: ${error}`} />}
      
      {/* User interaction area (only if not autoStart) */}
      {!autoStart && (
        <div className="space-y-2">
          <label htmlFor={`llm-input-${node.id}`} className="block text-sm font-medium text-gray-700">
            Twoja odpowiedź:
          </label>
          <Textarea
            id={`llm-input-${node.id}`}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Wpisz wiadomość..."
            rows={3}
            disabled={isLoading}
            aria-describedby={error ? "error-message-area" : undefined}
            aria-invalid={!!error}
          />
          
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !userInput.trim()}
          >
            Wyślij
          </Button>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && <LoadingSpinner />}
      
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
        <Button 
          onClick={onPrevious} 
          disabled={isLoading} 
          className="bg-gray-600 hover:bg-gray-700"
        >
          Wstecz
        </Button>
      </div>
    </div>
  );
};

export default LlmQueryTemplate;