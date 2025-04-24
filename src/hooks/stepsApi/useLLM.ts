// src/hooks/useLlm.ts
import { useState, useCallback, useEffect } from "react";
import { processTemplate } from "@/utils/byPath";
import { processLlmResponse } from "@/utils/apiUtils";
import { errorUtils } from "@/utils/errorUtils";
import { useAuth, useContextStore } from "..";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseLLMProps {
  initialUserMessage?: string;
  assistantMessage?: string;
  systemMessage?: string;
  schemaPath?: string;
  contextPath?: string;
  autoStart?: boolean;
  onDataSaved?: (data: any) => void;
}

/**
 * Hook do komunikacji z modelem LLM
 */
export function useLLM({
  initialUserMessage,
  assistantMessage,
  systemMessage,
  schemaPath,
  autoStart = false,
  onDataSaved,
}: UseLLMProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  const { getToken, user } = useAuth();
  const { getContextPath, getContext } = useContextStore();

  // Przetworzone wiadomości z szablonu
  const [processedInitialMessage, setProcessedInitialMessage] = useState("");
  const [processedAssistantMessage, setProcessedAssistantMessage] = useState("");

  // Pobierz i ustaw schemat
  useEffect(() => {
    if (schemaPath) {
      try {
        const schemaData = getContextPath(schemaPath);
        if (schemaData) {
          setSchema(schemaData);
        } else {
          console.warn(`[useLLM] Schema not found at path: ${schemaPath}`);
        }
      } catch (err) {
        const errorMsg = errorUtils.handleError(err, "useLLM:getSchema");
        setError(`Błąd pobierania schematu: ${errorMsg}`);
      }
    }
  }, [schemaPath, getContextPath]);

  // Przetwórz wiadomości z szablonu
  useEffect(() => {
    try {
      const context = getContext();

      if (initialUserMessage) {
        const processed = processTemplate(initialUserMessage, context);
        setProcessedInitialMessage(processed);
      }

      if (assistantMessage) {
        const processed = processTemplate(assistantMessage, context);
        setProcessedAssistantMessage(processed);
      }
    } catch (err) {
      const errorMsg = errorUtils.handleError(err, "useLLM:processTemplate");
      setError(`Błąd przetwarzania wiadomości szablonowych: ${errorMsg}`);
    }
  }, [initialUserMessage, assistantMessage, getContext]);

  // Wyślij wiadomość do LLM
  const sendMessage = useCallback(
    async (message: string) => {
      try {
        if (!message.trim()) {
          console.warn("[useLLM] Empty message, skipping API call");
          return;
        }

        setIsLoading(true);
        setError(null);

        const token = await getToken();

        if (!token) {
          throw new Error(
            "Token autoryzacyjny niedostępny. Zaloguj się ponownie."
          );
        }

        if (!user) {
          throw new Error(
            "Użytkownik nie jest zalogowany. Zaloguj się ponownie."
          );
        }

        // Przygotuj wiadomości
        const messages: Message[] = [];

        // Dodaj systemową wiadomość jeśli wymagana
        if (systemMessage) {
          messages.push({
            role: "system",
            content: systemMessage,
          });
        }

        // Dodaj wiadomość inicjalizacyjną i odpowiedź asystenta jeśli istnieją
        if (processedInitialMessage) {
          let initialContent = processedInitialMessage;
          if (schema && !initialContent.includes("```json")) {
            initialContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${JSON.stringify(
              schema,
              null,
              2
            )}\n\`\`\``;
          }

          messages.push({
            role: "user",
            content: initialContent,
          });

          if (
            processedAssistantMessage &&
            processedAssistantMessage.trim() !== ""
          ) {
            messages.push({
              role: "assistant",
              content: processedAssistantMessage,
            });
          }
        }

        // Dodaj aktualną wiadomość użytkownika
        let userContent = message;
        if (schema && !userContent.includes("```json")) {
          userContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${JSON.stringify(
            schema,
            null,
            2
          )}\n\`\`\``;
        }

        messages.push({
          role: "user",
          content: userContent,
        });

        // Przygotuj payload do API
        const payload = {
          messages: messages,
          userId: user.uid,
        };

        // Ustaw informacje debugowania
        setDebugInfo(
          `Wysyłanie do: ${
            import.meta.env.VITE_API_URL
          }/api/v1/services/gemini/chat/completion`
        );

        // Wywołaj API
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/services/gemini/chat/completion`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          }
        );

        // Obsłuż błędy API
        if (!response.ok) {
          const errorMsg = await errorUtils.handleApiError(response, "useLLM:apiRequest");
          throw new Error(errorMsg);
        }

        // Przetwórz odpowiedź
        const apiResponseData = await response.json();
        const processedData = processLlmResponse(apiResponseData, schema);

        setResponseData(processedData);

        // Wywołaj callback z przetworzonymi danymi
        if (onDataSaved) {
          onDataSaved(processedData);
        }
      } catch (err) {
        const errorMsg = errorUtils.handleError(err, "useLLM:sendMessage");
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      getToken,
      user,
      systemMessage,
      processedInitialMessage,
      processedAssistantMessage,
      schema,
      onDataSaved,
    ]
  );

  // Autostart
  const handleAutoStart = useCallback(async () => {
    if (processedInitialMessage) {
      await sendMessage(processedInitialMessage);
      return;
    }
  }, [processedInitialMessage, sendMessage]);

  // Obsługa autostartu
  useEffect(() => {
    if (autoStart && !isLoading && !responseData && !error) {
      const timer = setTimeout(() => {
        handleAutoStart();
      }, 10);

      return () => clearTimeout(timer);
    }
  }, [autoStart, isLoading, responseData, error, handleAutoStart]);

  return {
    sendMessage,
    isLoading,
    error,
    debugInfo,
    responseData,
    processedInitialMessage,
    processedAssistantMessage,
    schema,
    handleAutoStart,
  };
}