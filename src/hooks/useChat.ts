// src/hooks/useChat.ts
import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';
import { useResponseProcessor } from '@/hooks/useResponseProcessor';

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface UseChatProps {
  includeSystemMessage?: boolean;
  systemMessage?: string;
  initialUserMessage?: string;
  assistantMessage?: string;
  contextPath?: string;
  llmSchemaPath?: string;
  autoStart?: boolean;
  onDataSaved?: (data: any) => void;
}

export interface UseChatReturn {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  debugInfo: string | null;
  responseData: any;
  processedInitialMessage: string;
  processedAssistantMessage: string;
  schema: string | null;
  handleAutoStart: () => Promise<void>;
}

export const useChat = ({
  includeSystemMessage = false,
  systemMessage = '',
  initialUserMessage = '',
  assistantMessage = '',
  contextPath = '',
  llmSchemaPath = '',
  autoStart = false,
  onDataSaved
}: UseChatProps): UseChatReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [processedInitialMessage, setProcessedInitialMessage] = useState('');
  const [processedAssistantMessage, setProcessedAssistantMessage] = useState('');
  const [schema, setSchema] = useState<string | null>(null);
  
  const { getToken, user } = useAuth();
  const { 
    processTemplate, 
    getContextPath, 
    getContext 
  } = useAppStore((state) => ({
    processTemplate: state.processTemplate,
    getContextPath: state.getContextPath,
    getContext: state.getContext
  }));

  // Sprawdź, czy mamy schemat JSON
  const hasSchema = !!llmSchemaPath;

  // Wykorzystanie nowego hooka do przetwarzania odpowiedzi
  const { 
    processResponse, 
    error: processingError 
  } = useResponseProcessor({
    contextPath,
    hasSchema,
    onProcessed: (data) => {
      if (onDataSaved) {
        onDataSaved(data);
      }
    }
  });

  // Ustawienie błędu z przetwarzania, jeśli wystąpił
  useEffect(() => {
    if (processingError) {
      setError(processingError);
    }
  }, [processingError]);

  // Pobierz schemat odpowiedzi
  const getResponseSchema = useCallback(() => {
    if (!llmSchemaPath) return null;
    
    try {
      const schema = getContextPath(llmSchemaPath);
      return schema ? JSON.stringify(schema, null, 2) : null;
    } catch (err) {
      console.error(`[useChat] Error retrieving schema from ${llmSchemaPath}:`, err);
      return null;
    }
  }, [llmSchemaPath, getContextPath]);

  // Przetwórz wiadomości szablonowe
  useEffect(() => {
    try {
      // Przetwórz wiadomości tylko gdy komponent jest zamontowany
      if (initialUserMessage) {
        const processed = processTemplate(initialUserMessage);
        setProcessedInitialMessage(processed);
      }

      if (assistantMessage) {
        const processed = processTemplate(assistantMessage);
        setProcessedAssistantMessage(processed);
      }
      
      // Pobierz schemat
      const schemaData = getResponseSchema();
      setSchema(schemaData);
      
    } catch (err) {
      console.error('[useChat] Error processing template messages:', err);
      setError('Błąd przetwarzania wiadomości szablonowych');
    }
  }, [initialUserMessage, assistantMessage, processTemplate, getResponseSchema]);

  // Główna funkcja wysyłająca wiadomość
  const sendMessage = async (message: string) => {
    try {
      if (!message.trim()) {
        console.warn('[useChat] Empty message, skipping API call');
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      // Pobierz aktualny token JWT
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token autoryzacyjny niedostępny. Zaloguj się ponownie.');
      }
      
      if (!user) {
        throw new Error('Użytkownik nie jest zalogowany. Zaloguj się ponownie.');
      }
      
      // Przygotuj wiadomości do wysłania zgodnie z wymaganą kolejnością
      const messages: Message[] = [];
      
      // 1. Dodaj wiadomość systemową, jeśli węzeł ma ustawioną flagę includeSystemMessage
      if (includeSystemMessage && systemMessage) {
        messages.push({
          role: "system",
          content: systemMessage
        });
      }
      
      // 2. Sprawdź, czy mamy przetworzoną initialUserMessage
      if (processedInitialMessage) {
        // Dodaj schemat do wiadomości początkowej, jeśli istnieje
        let initialContent = processedInitialMessage;
        if (schema && !initialContent.includes('```json')) {
          initialContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${schema}\n\`\`\``;
        }
        
        // Jeśli mamy initialUserMessage, użyj jej jako pierwszej wiadomości użytkownika
        messages.push({
          role: "user",
          content: initialContent
        });
        
        // Jeśli mamy też wiadomość asystenta, dodaj ją po initialUserMessage
        if (processedAssistantMessage && processedAssistantMessage.trim() !== '') {
          messages.push({
            role: "assistant",
            content: processedAssistantMessage
          });
        }
      }
      
      // 3. Dodaj bieżącą wiadomość użytkownika z schematem, jeśli potrzeba
      let userContent = message;
      if (schema && !userContent.includes('```json')) {
        userContent += `\n\nUżyj następującego schematu JSON:\n\`\`\`json\n${schema}\n\`\`\``;
      }
      
      messages.push({
        role: "user",
        content: userContent
      });
      
      // Format danych według wymaganej struktury
      const payload = {
        messages: messages,
        userId: user.uid
      };
      
      setDebugInfo(`Wysyłanie do: ${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`);
      console.log('[useChat] Sending messages:', messages);
      
      // Wysyłanie żądania do Gemini API z tokenem JWT w nagłówku Authorization
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("[useChat] Błąd odpowiedzi:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error?.message || 
            `Żądanie API zakończone błędem: ${response.status}`
          );
        } catch (e) {
          // Jeśli nie możemy sparsować JSON, użyj surowego tekstu
          throw new Error(`Żądanie API zakończone błędem: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }
      
      const apiResponseData = await response.json();
      console.log("[useChat] Response data:", apiResponseData);
      
      // Przetwórz odpowiedź za pomocą nowego hooka
      const processedData = processResponse(apiResponseData);
      setResponseData(processedData);
      
    } catch (err) {
      console.error('[useChat] Error:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja obsługująca automatyczne uruchomienie
  const handleAutoStart = useCallback(async () => {
    if (!autoStart || isLoading || responseData || error) return;
    
    console.log('[useChat] Auto-start triggered');
    const context = getContext();
    
    // Opcja 1: Używamy przetworzonej wiadomości początkowej
    if (processedInitialMessage) {
      console.log('[useChat] Auto-starting with processed initial message');
      await sendMessage(processedInitialMessage);
      return;
    }
    
    // Opcja 2: Wykrywamy kontekst i tworzymy podstawowe zapytanie 
    const webContext = context.primaryWebAnalysing;
    if (webContext?.www) {
      console.log('[useChat] Auto-starting with constructed message for website:', webContext.www);
      
      let message = `Przeanalizuj adres www ${webContext.www}.`;
      if (schema) {
        message += ` Odpowiedź wyślij jako obiekt JSON zgodnie ze schematem.`;
      }
      
      await sendMessage(message);
    } else {
      console.warn('[useChat] Auto-start skipped: Missing required context');
    }
  }, [autoStart, isLoading, responseData, error, processedInitialMessage, sendMessage, getContext, schema]);

  // Hook do automatycznego uruchomienia
  useEffect(() => {
    if (autoStart && !isLoading && !responseData && !error) {
      const timer = setTimeout(() => {
        handleAutoStart();
      }, 200);
      
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
};