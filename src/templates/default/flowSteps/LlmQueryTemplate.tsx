// src/templates/flowSteps/LlmQueryTemplate.tsx
import React, { useState, useEffect } from "react";
import { FlowStepProps } from "template-registry-module";

import { useAppStore } from "@/lib/store";
import { useChat } from "@/hooks/useChat";
import { messagesStyles } from "../resources/messagesStyles";
import { NodeData, Scenario } from "@/views/types";

// Rozszerzony interfejs dla FlowStepProps, który uwzględnia scenario i rozszerzony node
interface ExtendedFlowStepProps extends Omit<FlowStepProps, "node"> {
  node: NodeData;
  scenario?: Scenario;
  contextItems?: ContextItem[];
}

interface ContextItem {
  id: string;
  title?: string;
  contentType?: string;
  content: any;
  updatedAt?: any;
}

interface InfoBadgeProps {
  type: "assistant" | "system" | "user" | "debug";
  title: string;
  content: string;
  className?: string;
}

interface LlmQueryAttrs {
  llmSchemaPath?: string;
  includeSystemMessage?: boolean;
  initialUserMessage?: string;
  [key: string]: any;
}

const InfoBadge: React.FC<InfoBadgeProps> = ({
  type,
  title,
  content,
  className = "",
}) => {
  const style = messagesStyles[type];

  return (
    <div className={`p-3 rounded-lg border ${style.container} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full ${style.iconBg}`}>
          <div className={style.iconColor}>{style.icon}</div>
        </div>
        <div>
          <h3 className={style.titleColor}>{title}</h3>
          <p className={style.textColor}>{content}</p>
        </div>
      </div>
    </div>
  );
};

const LlmQueryTemplate: React.FC<ExtendedFlowStepProps> = ({
  node,
  scenario,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const [userInput, setUserInput] = useState("");
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [schemaForUserMessage, setSchemaForUserMessage] = useState<string>("");
  const processTemplate = useAppStore((state) => state.processTemplate);
  const getContextPath = useAppStore((state) => state.getContextPath);

  // Bezpieczne typowanie dla node.attrs
  const attrs = (node.attrs as LlmQueryAttrs) || {};

  // Przetwarzamy wiadomość asystenta używając funkcji z AppStore tylko jeśli istnieje
  const processedAssistantMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : null;

  // Pobierz schemat LLM, jeśli jest dostępny
  useEffect(() => {
    if (attrs?.llmSchemaPath) {
      const schema = getContextPath(attrs.llmSchemaPath);
      if (schema) {
        // Sprawdź, czy schema to string czy obiekt
        if (typeof schema === 'string') {
          setSchemaForUserMessage(schema);
        } else if (schema.systemPrompt) {
          // Jeśli obiekt, pobierz systemPrompt
          setSchemaForUserMessage(schema.systemPrompt);
        } else {
          // Jeśli to zwykły obiekt bez property systemPrompt, konwertuj go na string
          try {
            const schemaString = JSON.stringify(schema, null, 2);
            setSchemaForUserMessage(schemaString);
          } catch (error) {
            console.error("Nie udało się skonwertować schematu na string:", error);
          }
        }
      }
    }
  }, [attrs, getContextPath]);

  // Przygotuj ostateczną wiadomość systemową (tylko z szablonu, bez schematu)
  let effectiveSystemMessage = "";
  if (scenario?.systemMessage) {
    effectiveSystemMessage = scenario.systemMessage;
  }

  // Przygotuj wiadomość użytkownika z dodanym schematem
  let effectiveUserMessage = "";
  if (attrs.initialUserMessage && schemaForUserMessage) {
    effectiveUserMessage = `${processTemplate(attrs.initialUserMessage)}\n\n${schemaForUserMessage}`;
  } else if (attrs.initialUserMessage) {
    effectiveUserMessage = processTemplate(attrs.initialUserMessage);
  } else if (schemaForUserMessage) {
    effectiveUserMessage = schemaForUserMessage;
  }

  // Używamy hooka useChat
  const { sendMessage, isLoading, error, debugInfo } = useChat({
    includeSystemMessage: attrs.includeSystemMessage || false,
    systemMessage: effectiveSystemMessage,
    initialUserMessage: effectiveUserMessage,
    assistantMessage: processedAssistantMessage || "",
    contextPath: node.contextPath || "",
    onDataSaved: (data) => {
      if (node.contextKey) {
        onSubmit(data);
      } else {
        onSubmit(data);
      }
      setUserInput("");
    },
  });

  const handleSubmit = () => {
    if (userInput.trim() === "") return;
    sendMessage(userInput);
  };

  return (
    <div className="space-y-4">
      {/* Wyświetl wiadomość systemową tylko jeśli includeSystemMessage=true i wiadomość istnieje */}
      {attrs.includeSystemMessage && effectiveSystemMessage && (
        <InfoBadge
          type="system"
          title="System Message"
          content={effectiveSystemMessage}
        />
      )}

      {/* Wyświetl wiadomość użytkownika tylko jeśli istnieje */}
      {effectiveUserMessage && (
        <InfoBadge
          type="user"
          title="Initial User Message"
          content={effectiveUserMessage}
        />
      )}

      {/* Wyświetl wiadomość asystenta tylko jeśli istnieje */}
      {processedAssistantMessage && (
        <InfoBadge
          type="assistant"
          title="Asystent AI"
          content={processedAssistantMessage}
          className="p-4"
        />
      )}

      {debugInfo && (
        <InfoBadge type="debug" title="Debug" content={debugInfo} />
      )}

      <div className="space-y-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Zapytaj asystenta AI..."
        />

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            Błąd: {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Wstecz
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || userInput.trim() === ""}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Przetwarzanie...</span>
              </>
            ) : (
              <span>{isLastNode ? "Zakończ" : "Wyślij i Kontynuuj"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlmQueryTemplate;