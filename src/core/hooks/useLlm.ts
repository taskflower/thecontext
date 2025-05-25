// src/core/hooks/useLlm.ts
import { useState, useCallback, useMemo } from "react";
import { ZodType } from "zod";

import { useAuthContext } from "../../auth/AuthContext";
import { useFlow } from "../context";

interface LlmHookOptions<T> {
  schema: ZodType<T>;
  jsonSchema?: any;
  userMessage: string;
  systemMessage?: string;
  autoStart?: boolean;
  apiEndpoint?: string;
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
}: LlmHookOptions<T>): LlmHookResult<T> => {
  const { get } = useFlow();
  const { user, getToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const processTemplateString = useCallback(
    (str: string) =>
      str.replace(/{{([^}]+)}}/g, (_, path) => {
        const value = get(path.trim());
        return value !== undefined ? String(value) : "";
      }),
    [get]
  );

  const processedUserMessage = useMemo(
    () => processTemplateString(userMessage),
    [processTemplateString, userMessage]
  );

  const startLlmProcess = useCallback(async () => {
    if (isLoading) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);

    try {
      const messages: { role: string; content: string }[] = [];
      
      if (jsonSchema) {
        messages.push({
          role: "system",
          content: `Zwróć wyłącznie obiekt JSON dokładnie zgodny ze schematem: ${JSON.stringify(
            jsonSchema
          )}`,
        });
      }
      
      if (systemMessage) {
        messages.push({
          role: "system",
          content: processTemplateString(systemMessage),
        });
      }
      messages.push({ role: "user", content: processedUserMessage });

      const payload = {
        messages,
        generationConfig: jsonSchema
          ? { responseSchema: jsonSchema, temperature: 0.7 }
          : { temperature: 0.7 },
      };

      const token = await getToken();
      if (!token || !user)
        throw new Error(
          token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji"
        );

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
      
      if (!response.ok) {
        const errInfo = await response.json();
        throw new Error(
          errInfo.error?.message || "Nieznany błąd podczas wysyłania wiadomości"
        );
      }

      const { result: llmResult } = await response.json();
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