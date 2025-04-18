// src/flowSteps/LlmQueryTemplate.tsx
import React, { useState } from "react";
import { useLLM } from "@/hooks/useLLM";

import {
  Loader,
  Info,
  Database,
  AlertTriangle,
  User,
  Settings,
  ArrowLeft,
  Send,
  Play,
} from "lucide-react";
import { FlowStepProps } from "@/views/types";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";

// --- UI Components ---
const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center p-8">
    <div className="relative w-10 h-10">
      <Loader className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
    <p className="mt-4 text-sm font-medium text-gray-700">
      Ładowanie odpowiedzi AI...
    </p>
  </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center px-4 py-3 mt-3 text-sm font-medium text-red-800 bg-red-50 rounded-lg">
    <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
    <span>{message}</span>
  </div>
);

const MessageCard: React.FC<{
  title: string;
  content: string | React.ReactNode;
  icon?: React.ReactNode;
}> = ({
  title,
  content,
  icon = <Info className="w-4 h-4 text-indigo-500" />,
}) => (
  <div className="overflow-hidden transition-all bg-white rounded-lg shadow-sm ring-1 ring-gray-100 hover:shadow">
    <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
      <span className="flex items-center text-xs font-medium text-gray-600">
        {icon}
        <span className="ml-2">{title}</span>
      </span>
    </div>
    <div className="p-4">
      {typeof content === "string" ? (
        content ? (
          content
        ) : (
          <span className="text-xs italic text-gray-400">(brak)</span>
        )
      ) : (
        content
      )}
    </div>
  </div>
);

export const LlmQueryTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
}) => {
  // Input validation
  if (!node) {
    console.error("[LlmQueryTemplate] Render cancelled: Node data is missing.");
    return (
      <ErrorMessage message="Błąd krytyczny: Dane węzła (node) nie zostały załadowane." />
    );
  }

  const [userInput, setUserInput] = useState("");
  const { getCurrentScenario } = useWorkspaceStore();

  // --- Get config data from node and scenario ---
  const currentScenario = getCurrentScenario();
  const attrs = node?.attrs || {};
  const autoStart = attrs.autoStart === true;
  const includeSystemMessage = attrs.includeSystemMessage === true;
  const systemMessageContent = includeSystemMessage
    ? currentScenario?.systemMessage || ""
    : "";
  const initialUserMessage = attrs.initialUserMessage || "";
  const schemaPath = attrs.schemaPath || "";

  // Wykorzystanie hooka useLlmWithZod
  const {
    sendMessage,
    isLoading,
    error,
    debugInfo,
    responseData,
    processedInitialMessage,
    processedAssistantMessage,
    schema,
    handleAutoStart,
  } = useLLM({
    initialUserMessage: initialUserMessage,
    assistantMessage: node.assistantMessage || "",
    systemMessage: systemMessageContent,
    schemaPath: schemaPath,
    contextPath: node.contextPath,
    autoStart,
    onDataSaved: (data) => {
     
      if (data) {
        onSubmit(data);
        setUserInput("");
      }
    },
  });

  // Handle user input submission
  const handleSubmit = () => {
    if (!userInput.trim()) return;
    sendMessage(userInput);
  };

  // Message card icons
  const icons = {
    system: <Settings className="w-4 h-4 text-purple-500" />,
    user: <User className="w-4 h-4 text-blue-500" />,
    schema: <Database className="w-4 h-4 text-emerald-500" />,
    debug: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  };

  return (
    <div className="overflow-hidden bg-gray-50 rounded-xl">
      {/* Assistant message */}
      {node.assistantMessage && (
        <div className="p-5 bg-white shadow-sm">
          <div className="flex items-center mb-3">
            <div className="flex items-center justify-center w-8 h-8 mr-3 text-white bg-indigo-600 rounded-full">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-medium text-gray-700">Asystent AI</h3>
          </div>
          <div className="pl-11">
            <p className="text-gray-700 whitespace-pre-wrap">
              {processedAssistantMessage}
            </p>
          </div>
        </div>
      )}

      {/* Zmiana: Wiadomości systemowe jedna pod drugą */}
      <div className="flex flex-col gap-4 p-5">
        <MessageCard
          title="Wiadomość systemowa"
          content={
            <p className="text-sm text-gray-700">{systemMessageContent}</p>
          }
          icon={icons.system}
        />

        <MessageCard
          title="Początkowa wiadomość użytkownika"
          content={
            <p className="text-sm text-gray-700">{processedInitialMessage}</p>
          }
          icon={icons.user}
        />

        {schema && (
          <MessageCard
            title={`Schema: {{${schemaPath}}}`}
            content={
              <pre className="p-3 max-h-40 overflow-scroll text-xs font-mono text-gray-700 bg-gray-50 rounded-md max-h-60">
                {JSON.stringify(schema, null, 2)}
              </pre>
            }
            icon={icons.schema}
          />
        )}

        {debugInfo && (
          <MessageCard
            title="Informacje diagnostyczne"
            content={<p className="text-sm text-gray-700">{debugInfo}</p>}
            icon={icons.debug}
          />
        )}
      </div>

      {/* Display errors */}
      {error && <ErrorMessage message={`Błąd API: ${error}`} />}

      {/* Loading indicator */}
      {isLoading && <LoadingSpinner />}

      {/* User interaction area (only if not autoStart) */}
      {!autoStart && (
        <div className="p-5 bg-white border-t border-gray-100">
          <label
            htmlFor={`llm-input-${node.id}`}
            className="block mb-2 text-sm font-medium text-gray-700"
          >
            Twoja odpowiedź:
          </label>
          <div className="space-y-3">
            <textarea
              id={`llm-input-${node.id}`}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="block w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="Wpisz wiadomość..."
              rows={4}
              disabled={isLoading}
            />

            <button
              onClick={handleSubmit}
              disabled={isLoading || !userInput.trim()}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 -ml-1 text-white animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2 -ml-1" />
                  Wyślij
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex items-center justify-between p-5 bg-white border-t border-gray-100">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:text-gray-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2 -ml-1" />
          Wstecz
        </button>

        {/* Autostart button is only needed if we want to manually trigger it */}
        {autoStart && !isLoading && !responseData && (
          <button
            onClick={handleAutoStart}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-lg shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Play className="w-4 h-4 mr-2 -ml-1" />
            Uruchom automatycznie
          </button>
        )}
      </div>
    </div>
  );
};

export default LlmQueryTemplate;
