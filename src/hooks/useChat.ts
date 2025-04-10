// src/hooks/UseChat.ts
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/lib/store';


interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface UseChatProps {
  includeSystemMessage?: boolean;
  systemMessage?: string;
  initialUserMessage?: string;
  assistantMessage?: string;
  contextPath?: string;
  onDataSaved?: (data: string) => void;
}

interface UseChatReturn {
  sendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  debugInfo: string | null;
}

export const useChat = ({
  includeSystemMessage = false,
  systemMessage = '',
  initialUserMessage = '',
  assistantMessage = '',
  contextPath = '',
  onDataSaved
}: UseChatProps): UseChatReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  const { getToken, user } = useAuth();
  const updateByContextPath = useAppStore(state => state.updateByContextPath);

  const sendMessage = async (message: string) => {
    try {
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
      
      // 2. Sprawdź, czy mamy initial user message
      if (initialUserMessage) {
        // Jeśli mamy initialUserMessage, użyj jej jako pierwszej wiadomości użytkownika
        console.log("Using initialUserMessage:", initialUserMessage);
        messages.push({
          role: "user",
          content: initialUserMessage
        });
        
        // Jeśli mamy też wiadomość asystenta, dodaj ją po initialUserMessage
        if (assistantMessage && assistantMessage.trim() !== '') {
          messages.push({
            role: "assistant",
            content: assistantMessage
          });
        }
      }
      
      // 3. Dodaj bieżącą wiadomość użytkownika
      messages.push({
        role: "user",
        content: message
      });
      
      console.log("Prepared messages:", messages);
      
      // Format danych według wymaganej struktury
      const payload = {
        messages: messages,
        userId: user.uid
      };
      
      setDebugInfo(`Wysyłanie do: ${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`);
      
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
        console.error("Błąd odpowiedzi:", errorText);
        
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
      
      const responseData = await response.json();
      console.log("Dane odpowiedzi:", responseData);
      
      // Przygotuj dane do zapisania w kontekście
      const conversationData = {
        userInput: message,
        aiResponse: responseData
      };
      
      // Zapisywanie danych w zależności od dostępności contextPath
      if (contextPath) {
        console.log(`Zapisywanie danych do contextPath: ${contextPath}`);
        updateByContextPath(contextPath, JSON.stringify(conversationData));
      }
      
      // Wywołanie callback'a z danymi
      if (onDataSaved) {
        onDataSaved(JSON.stringify(conversationData));
      }
      
    } catch (err) {
      console.error('Pełny błąd:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    debugInfo
  };
};