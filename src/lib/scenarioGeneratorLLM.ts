// src/services/llm.ts
import { useAuth } from '@/hooks/useAuth';

/**
 * Interfejs dla odpowiedzi LLM
 */
interface LlmResponse {
  success: boolean;
  data?: {
    message: {
      content: string;
    };
  };
  error?: string;
}

/**
 * Klasa serwisu do komunikacji z API modelu językowego
 */
export class LlmService {
  private apiUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(apiUrl: string, getAuthToken: () => Promise<string | null>) {
    this.apiUrl = apiUrl;
    this.getAuthToken = getAuthToken;
  }

  /**
   * Generuje odpowiedź od modelu językowego na podstawie podanego promptu
   */
  async generateCompletion(prompt: string): Promise<string> {
    try {
      const token = await this.getAuthToken();
      
      if (!token) {
        throw new Error("Brak tokenu autoryzacyjnego. Zaloguj się ponownie.");
      }

      // Przygotowanie wiadomości dla modelu
      const messages = [
        {
          role: "system",
          content: "Jesteś asystentem pomagającym w tworzeniu definicji scenariuszy dla aplikacji flow builder. Zwracaj dokładnie sformatowane dane JSON zgodne z podanym schematem. Twój kod musi być prawidłowym TypeScript.",
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      // Wywołanie API
      const response = await fetch(`${this.apiUrl}/api/v1/services/gemini/chat/completion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: messages,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("LLM API Error:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error?.message || `API request failed: ${response.status}`
          );
        } catch (e) {
          throw new Error(
            `API request failed: ${response.status} - ${errorText.substring(0, 100)}...`
          );
        }
      }

      // Przetworzenie odpowiedzi
      const result: LlmResponse = await response.json();
      
      if (!result.success || !result.data?.message?.content) {
        throw new Error(result.error || "Nieprawidłowa odpowiedź z API");
      }

      // Wyodrębnij JSON z odpowiedzi, jeśli jest zawinięty w bloku kodu
      const content = result.data.message.content;
      const jsonRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gm;
      const match = jsonRegex.exec(content);
      
      if (match && match[1]) {
        return match[1].trim();
      }
      
      // Jeśli nie ma bloków kodu, zwróć całą treść
      return content;
    } catch (error) {
      console.error("Error calling LLM service:", error);
      throw error;
    }
  }
}

/**
 * Hook do użycia serwisu LLM w komponentach React
 */
export function useLlmService() {
  const { getToken } = useAuth();
  const apiUrl = import.meta.env.VITE_API_URL || '';
  
  return new LlmService(apiUrl, getToken);
}