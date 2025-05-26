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
  const processedSystem = useMemo(() => 
    systemMessage ? processTemplate(systemMessage) : "", [systemMessage]);

  const start = useCallback(async () => {
    if (isLoading) return;
    setStarted(true);
    setIsLoading(true);
    setError(null);
    
    try {
      const msgs: LlmMessage[] = [];
      
      // SYSTEM MESSAGE - logika biznesowa, rola, ogólne zasady
      if (processedSystem) {
        msgs.push({ role: "system", content: processedSystem });
      }
      
      // USER MESSAGE - konkretne zadanie + wymagania formatu
      let finalUserMessage = `ZADANIE: ${processedUser}`;
      
      if (jsonSchema) {
        const enumFields = Object.entries(jsonSchema.properties || {})
          .filter(([_, field]: any) => field.enum)
          .map(([key, field]: any) => `${key}: ${field.enum.join(' | ')}`)
          .join('\n');

        const formatRequirements = `

WYMAGANY FORMAT ODPOWIEDZI:
Zwróć TYLKO poprawny JSON zgodny z tym schematem:
${JSON.stringify(jsonSchema, null, 2)}

KRYTYCZNE - WARTOŚCI ENUM (używaj DOKŁADNIE tych angielskich wartości):
${enumFields}

ZASADY FORMATU:
- Odpowiedz TYLKO JSON, bez komentarzy
- Używaj angielskich wartości enum (np. "high", NIE "wysoki")
- Wypełnij wszystkie wymagane pola`;

        finalUserMessage += formatRequirements;
      }
      
      msgs.push({ role: "user", content: finalUserMessage });

      const token = await getToken();
      if (!token || !user) {
        throw new Error(token ? "Użytkownik nie zalogowany" : "Brak tokenu");
      }

      const requestBody = {
        messages: msgs,
        userId: user.uid,
        generationConfig: {
          temperature: 0.7,
          ...(jsonSchema ? { 
            responseSchema: jsonSchema,
            candidateCount: 1,
            // Dodatkowe parametry dla Gemini
            responseMimeType: "application/json"
          } : {})
        }
      };

      console.log("LLM Request:", JSON.stringify(requestBody, null, 2));
      console.log("Schema being sent:", jsonSchema);

      const res = await fetch(
        apiEndpoint || `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${res.status}: ${res.statusText}`);
      }
      
      const responseData = await res.json();
      console.log("LLM Response:", responseData);
      
      const llmResult = responseData.result;
      
      if (schema && llmResult) {
        console.log("Validating with Zod schema:", llmResult);
        const validation = schema.safeParse(llmResult);
        if (!validation.success) {
          console.error("Zod validation failed:", validation.error);
          throw new Error("Nieprawidłowy format odpowiedzi: " + 
            validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '));
        }
        setResult(validation.data);
      } else {
        setResult(llmResult as T);
      }
    } catch (e: any) {
      console.error("LLM Engine Error:", e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [processedUser, processedSystem, jsonSchema, isLoading, getToken, user, schema]);

  useEffect(() => {
    if (autoStart) start();
  }, []);

  return { isLoading, error, result, started, start, setStarted };
}