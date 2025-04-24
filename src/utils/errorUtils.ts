// src/utils/errorUtils.ts

/**
 * Funkcje pomocnicze do obsługi błędów
 */
export const errorUtils = {
    /**
     * Przetwarza błąd na string komunikatu
     */
    getErrorMessage: (error: unknown): string => {
      if (error instanceof Error) {
        return error.message;
      }
      return typeof error === 'string' ? error : 'Wystąpił nieznany błąd';
    },
    
    /**
     * Loguje błąd i zwraca komunikat
     */
    handleError: (error: unknown, context: string): string => {
      const message = errorUtils.getErrorMessage(error);
      console.error(`[${context}] Error:`, error);
      return message;
    },
    
    /**
     * Obsługuje błąd API
     */
    handleApiError: async (response: Response, context: string): Promise<string> => {
      const errorText = await response.text();
      console.error(`[${context}] API Error:`, errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return errorData.error?.message || `API request failed: ${response.status}`;
      } catch {
        return `API request failed: ${response.status} - ${errorText.substring(0, 100)}...`;
      }
    }
  };