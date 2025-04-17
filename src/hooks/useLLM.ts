// src/hooks/useLlmWithZod.ts
import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useAppStore } from "@/lib/store";
import { z } from "zod";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseLlmWithZodProps {
  initialUserMessage?: string;
  assistantMessage?: string;
  systemMessage?: string;
  schemaPath?: string;
  contextPath?: string;
  autoStart?: boolean;
  onDataSaved?: (data: any) => void;
}

export function useLlmWithZod({
  initialUserMessage,
  assistantMessage,
  systemMessage,
  schemaPath,
  contextPath,
  autoStart = false,
  onDataSaved
}: UseLlmWithZodProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  const { getToken, user } = useAuth();
  const { processTemplate, getContextPath, updateByContextPath } = useAppStore();

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
          console.warn(`[useLlmWithZod] Schema not found at path: ${schemaPath}`);
        }
      } catch (err) {
        console.error(`[useLlmWithZod] Error retrieving schema from ${schemaPath}:`, err);
        setError(`Błąd pobierania schematu: ${err}`);
      }
    }
  }, [schemaPath, getContextPath]);

  // Przetwórz wiadomości z szablonu
  useEffect(() => {
    try {
      if (initialUserMessage) {
        const processed = processTemplate(initialUserMessage);
        setProcessedInitialMessage(processed);
      }

      if (assistantMessage) {
        const processed = processTemplate(assistantMessage);
        setProcessedAssistantMessage(processed);
      }
    } catch (err) {
      console.error("[useLlmWithZod] Error processing template messages:", err);
      setError("Błąd przetwarzania wiadomości szablonowych");
    }
  }, [initialUserMessage, assistantMessage, processTemplate]);

  // Wyślij wiadomość do LLM
  const sendMessage = useCallback(async (message: string) => {
    try {
      if (!message.trim()) {
        console.warn("[useLlmWithZod] Empty message, skipping API call");
        return;
      }

      setIsLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        throw new Error("Token autoryzacyjny niedostępny. Zaloguj się ponownie.");
      }

      if (!user) {
        throw new Error("Użytkownik nie jest zalogowany. Zaloguj się ponownie.");
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
          initialContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
        }

        messages.push({
          role: "user",
          content: initialContent,
        });

        if (processedAssistantMessage && processedAssistantMessage.trim() !== "") {
          messages.push({
            role: "assistant",
            content: processedAssistantMessage,
          });
        }
      }

      // Dodaj aktualną wiadomość użytkownika
      let userContent = message;
      if (schema && !userContent.includes("```json")) {
        userContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${JSON.stringify(schema, null, 2)}\n\`\`\``;
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
      setDebugInfo(`Wysyłanie do: ${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`);

      // Wywołaj API
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`,
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
        const errorText = await response.text();
        console.error("[useLlmWithZod] API Error:", errorText);

        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error?.message ||
              `API request failed: ${response.status}`
          );
        } catch (e) {
          throw new Error(
            `API request failed: ${response.status} - ${errorText.substring(0, 100)}...`
          );
        }
      }

      // Przetwórz odpowiedź
      const apiResponseData = await response.json();
      const processedData = processResponse(apiResponseData);
      
      setResponseData(processedData);
      
      // Wywołaj callback z przetworzonymi danymi
      if (onDataSaved) {
        onDataSaved(processedData);
      }
    } catch (err) {
      console.error("[useLlmWithZod] Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [getToken, user, systemMessage, processedInitialMessage, processedAssistantMessage, schema, onDataSaved]);

  // Funkcja do przetwarzania odpowiedzi z API
  const processResponse = useCallback((apiResponse: any): any => {
    if (!apiResponse?.success || !apiResponse?.data?.message?.content) {
      console.error("[useLlmWithZod] Invalid API response format");
      return null;
    }

    const content = apiResponse.data.message.content;

    // Wyodrębnij JSON z odpowiedzi
    const extractedData = extractJsonFromContent(content);
    
    // Jeśli mamy schemat, waliduj dane
    if (schema && extractedData) {
      try {
        // Stwórz schemat Zod dynamicznie
        const zodSchema = createZodSchema(schema);
        
        // Waliduj dane
        const result = zodSchema.safeParse(extractedData);
        
        if (!result.success) {
          // Formatuj błędy
          const errorDetails = result.error.errors
            .map(e => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
            
          console.error(`[useLlmWithZod] Validation errors: ${errorDetails}`);
          
          // Mimo błędów walidacji, zwracamy oryginalne dane
          // z dodaną informacją o błędach
          return {
            ...extractedData,
            _validationErrors: result.error.errors
          };
        }
        
        // Jeśli walidacja się powiodła, zwracamy zwalidowane dane
        return result.data;
      } catch (validationError) {
        console.error("[useLlmWithZod] Validation error:", validationError);
        return extractedData;
      }
    }
    
    // Jeśli nie ma schematu, zwracamy wyodrębnione dane
    return extractedData;
  }, [schema]);

  // Funkcja do wyodrębniania JSON z treści
  const extractJsonFromContent = (content: string): any => {
    // Próbuj wyodrębnić JSON z bloku markdown
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/gm;
    const match = jsonRegex.exec(content);
    
    if (match && match[1]) {
      try {
        return JSON.parse(match[1].trim());
      } catch (e) {
        console.error("[useLlmWithZod] Error parsing JSON from markdown block:", e);
      }
    }

    // Jeśli nie ma bloku markdown, spróbuj potraktować całą odpowiedź jako JSON
    try {
      return JSON.parse(content);
    } catch (e) {
      // Jeśli nie udało się sparsować jako JSON, zwróć tekstową odpowiedź
      return { content: content };
    }
  };

  // Funkcja do tworzenia schematu Zod z obiektu JSON
  const createZodSchema = (obj: any): z.ZodType => {
    if (Array.isArray(obj)) {
      return z.array(obj.length > 0 ? createZodSchema(obj[0]) : z.any());
    }
    if (typeof obj === 'object' && obj !== null) {
      const entries = Object.entries(obj).reduce((acc, [key, val]) => {
        acc[key] = createZodSchema(val);
        return acc;
      }, {} as Record<string, z.ZodType>);
      return z.object(entries);
    }
    if (typeof obj === 'string') return z.string();
    if (typeof obj === 'number') return z.number();
    if (typeof obj === 'boolean') return z.boolean();
    return z.any();
  };

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
      }, 1000);

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
    handleAutoStart
  };
}