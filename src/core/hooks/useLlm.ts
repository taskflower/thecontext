// src/core/hooks/useLlm.ts
import { useState, useCallback, useMemo } from "react";
import { ZodType } from "zod";
import { useFlow } from "..";

interface LlmHookOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  userMessage: string;
  systemMessage?: string;
  autoStart?: boolean;
  apiEndpoint?: string;
  getToken: () => Promise<string | null>;
  user: any;
}

interface LlmHookResult<T> {
  isLoading: boolean;
  error: string | null;
  result: T | null;
  started: boolean;
  processedUserMessage: string;
  startLlmProcess: () => Promise<void>;
  setStarted: (started: boolean) => void;
}

export const useLlm = <T>({
  schema,
  jsonSchema,
  userMessage,
  systemMessage,
  autoStart = false,
  apiEndpoint,
  getToken,
  user,
}: LlmHookOptions<T>): LlmHookResult<T> => {
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  // Memoizacja funkcji do przetwarzania templatu
  const processTemplateString = useCallback(
    (str: string) =>
      str.replace(/{{([^}]+)}}/g, (_, path) => {
        const value = get(path.trim());
        return value !== undefined ? String(value) : "";
      }),
    [get]
  );

  // Memoizacja przetworzonej wiadomości użytkownika
  const processedUserMessage = useMemo(
    () => processTemplateString(userMessage),
    [processTemplateString, userMessage]
  );

  // Memoizacja funkcji startującej proces LLM
  const startLlmProcess = useCallback(async () => {
    if (isLoading) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);

    try {
      // Przygotowanie wiadomości do LLM
      const messages: { role: string; content: string }[] = [];
      
      // Dodanie schematu JSON jeśli istnieje
      if (jsonSchema) {
        messages.push({
          role: "system",
          content: `Zwróć wyłącznie obiekt JSON dokładnie zgodny ze schematem: ${JSON.stringify(
            jsonSchema
          )}`,
        });
      }
      
      // Dodanie wiadomości systemowej jeśli istnieje
      if (systemMessage) {
        messages.push({
          role: "system",
          content: processTemplateString(systemMessage),
        });
      }
      
      // Dodanie wiadomości użytkownika
      messages.push({ role: "user", content: processedUserMessage });

      // Przygotowanie ładunku do wysłania
      const payload = {
        messages,
        generationConfig: jsonSchema
          ? { responseSchema: jsonSchema, temperature: 0.7 }
          : { temperature: 0.7 },
      };

      // Pobranie tokenu autoryzacji
      const token = await getToken();
      if (!token || !user)
        throw new Error(
          token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji"
        );

      // Wywołanie API
      const response = await fetch(
        apiEndpoint ||
          `${
            import.meta.env.VITE_API_URL
          }/api/v1/services/gemini/chat/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ...payload, userId: user.uid }),
        }
      );
      
      // Obsługa błędów HTTP
      if (!response.ok) {
        const errInfo = await response.json();
        throw new Error(
          errInfo.error?.message || "Nieznany błąd podczas wysyłania wiadomości"
        );
      }

      // Parsowanie odpowiedzi
      const { result: llmResult } = await response.json();

      // Walidacja schematu jeśli istnieje
      if (schema) {
        const validation = schema.safeParse(llmResult);
        if (!validation.success) {
          throw new Error(
            "Nieprawidłowy format odpowiedzi: " + validation.error.message
          );
        }
        setResult(validation.data);
      } else {
        setResult(llmResult as any);
      }

      setIsLoading(false);
    } catch (err: any) {
      setError(err.message || "Wystąpił nieznany błąd");
      setIsLoading(false);
    }
  }, [
    processedUserMessage,
    processTemplateString,
    systemMessage,
    jsonSchema,
    isLoading,
    schema,
    getToken,
    user,
    apiEndpoint,
  ]);

  return {
    isLoading,
    error,
    result,
    started,
    processedUserMessage,
    startLlmProcess,
    setStarted,
  };
};