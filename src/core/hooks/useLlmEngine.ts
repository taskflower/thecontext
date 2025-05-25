// ----------------------------------------
// src/core/hooks/useLlmEngine.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { useEngineStore } from "./useEngineStore";
import { useAuthContext } from "@/auth/AuthContext";
import type { LlmOptions, LlmHookResult, LlmMessage } from "../types";

export function useLlmEngine<T = any>({
  schema,
  jsonSchema,
  userMessage,
  systemMessage,
  autoStart = false,
  apiEndpoint,
}: LlmOptions<T>): LlmHookResult<T> {
  const { get } = useEngineStore();
  const { user, getToken } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const processTemplate = (str: string): string =>
    str.replace(/{{([^}]+)}}/g, (_, p) => String(get(p.trim()) ?? ""));

  const processedUser = useMemo(() => processTemplate(userMessage), [userMessage]);

  const start = useCallback(async () => {
    if (isLoading) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const msgs: LlmMessage[] = [];
      if (jsonSchema) {
        msgs.push({
          role: "system",
          content: `Zwróć JSON zgodny ze schemą: ${JSON.stringify(jsonSchema)}`,
        });
      }
      if (systemMessage) {
        msgs.push({ role: "system", content: processTemplate(systemMessage) });
      }
      msgs.push({ role: "user", content: processedUser });

      const token = await getToken();
      if (!token || !user) {
        throw new Error(token ? "Użytkownik nie zalogowany" : "Brak tokenu");
      }

      const res = await fetch(
        apiEndpoint || `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: msgs,
            generationConfig: jsonSchema
              ? { responseSchema: jsonSchema, temperature: 0.7 }
              : { temperature: 0.7 },
            userId: user.uid,
          }),
        }
      );
      
      if (!res.ok) {
        throw new Error((await res.json()).error?.message || "Błąd LLM");
      }
      
      const { result: llmRes } = await res.json();
      if (schema) {
        const v = schema.safeParse(llmRes);
        if (!v.success) {
          throw new Error("Nieprawidłowy format: " + v.error.message);
        }
        setResult(v.data);
      } else {
        setResult(llmRes as T);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [processedUser, systemMessage, jsonSchema, isLoading, getToken, user]);

  useEffect(() => {
    if (autoStart) start();
  }, []);

  return { isLoading, error, result, started, start, setStarted };
}