// src/themes/default/components/LlmStep.tsx
import { useState, useCallback, useMemo } from "react";
import { ZodType } from "zod";
import { useFlow } from "../../../core/context";

import { useAuth } from "@/hooks";

type LlmStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: T;
  onSubmit: (data: T) => void;
  userMessage: string;
  systemMessage?: string;
  showResults?: boolean;
  autoStart?: boolean;
  apiEndpoint?: string;
};

export default function LlmStep<T>({
  schema,
  jsonSchema,
  onSubmit,
  userMessage,
  systemMessage,
  showResults = false,
  autoStart = false,
  apiEndpoint,
}: LlmStepProps<T>) {
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const { getToken, user } = useAuth();

  // Process template strings with context values
  const processTemplateString = useCallback(
    (str: string) => {
      return str.replace(/{{([^}]+)}}/g, (_, path) => {
        const value = get(path.trim());
        return value !== undefined ? String(value) : "";
      });
    },
    [get]
  );

  const processedUserMessage = useMemo(
    () => processTemplateString(userMessage),
    [processTemplateString, userMessage]
  );

  const handleStart = useCallback(async () => {
    if (isLoading) return;

    setStarted(true);
    setIsLoading(true);
    setError(null);

    try {
      const messages = [
        ...(systemMessage
          ? [
              {
                role: "system",
                content: processTemplateString(systemMessage),
              },
            ]
          : []),
        {
          role: "user",
          content: processedUserMessage,
        },
      ];

      const payload = {
        messages,
        generationConfig: {
          temperature: 0.7,
          responseSchema: jsonSchema,
        },
      };

      const token = await getToken();
      if (!token || !user) {
        throw new Error(
          token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji"
        );
      }

      const apiUrl = apiEndpoint || `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, userId: user.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error?.message || "Nieznany błąd podczas wysyłania wiadomości"
        );
      }

      const responseData = await response.json();
      let llmResult: any = responseData.result;

      // Jeśli wynik jest stringiem JSON, spróbuj sparsować
      if (typeof llmResult === 'string') {
        try {
          llmResult = JSON.parse(llmResult);
        } catch {
          // jeśli parsing się nie powiedzie, zostaw oryginał
        }
      }

      // Walidacja wyników
      if (schema) {
        const validationResult = schema.safeParse(llmResult);
        if (!validationResult.success) {
          throw new Error(
            "Nieprawidłowy format odpowiedzi: " + validationResult.error.message
          );
        }
        setResult(validationResult.data);
      } else {
        setResult(llmResult);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieznany błąd");
      setIsLoading(false);
    }
  }, [processedUserMessage, processTemplateString, systemMessage, jsonSchema, isLoading, schema, getToken, user, apiEndpoint]);

  // Renderowanie UI
  if (!started) {
    return <button onClick={handleStart}>Rozpocznij</button>;
  }
  if (isLoading) {
    return <div>Ładowanie...</div>;
  }
  if (error) {
    return <div className="text-red-600">Błąd: {error}</div>;
  }
  if (result) {
    // wyświetl wynik jako sformatowany JSON
    return <pre>{JSON.stringify(result, null, 2)}</pre>;
  }

  return <div onClick={handleStart}>Kliknij, aby uruchomić</div>;
}
