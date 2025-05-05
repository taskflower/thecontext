// src/utils/errors.ts
// Funkcje utility do obsługi błędów

/**
 * Zwraca czytelny komunikat błędu z różnych typów błędów
 * 
 * @param error - Obiekt błędu do przetworzenia
 * @returns Ciąg znaków z komunikatem błędu
 */
export function getErrorMessage(error: unknown): string {
    if (!error) return 'Wystąpił nieznany błąd';
    
    // Obsługa błędów typu Error
    if (error instanceof Error) {
      return error.message;
    }
    
    // Obsługa błędów przekazanych jako ciąg znaków
    if (typeof error === 'string') {
      return error;
    }
    
    // Obsługa błędów przekazanych jako obiekty z polem message
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String(error.message);
    }
    
    // Domyślny komunikat dla wszystkich innych przypadków
    return `Nieoczekiwany błąd: ${JSON.stringify(error)}`;
  }
  
  /**
   * Obsługuje błędy API i zwraca odpowiedni komunikat błędu
   * 
   * @param response - Odpowiedź API
   * @param context - Kontekst, w którym wystąpił błąd (np. nazwa operacji)
   * @returns Obietnica zwracająca komunikat błędu
   */
  export async function handleApiError(response: Response, context: string = 'api'): Promise<string> {
    try {
      // Próba pobrania szczegółów błędu z odpowiedzi
      const contentType = response.headers.get('content-type');
      
      // Obsługa odpowiedzi typu JSON
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await response.json();
          
          // Obsługa różnych formatów błędów
          if (errorData.error) {
            return typeof errorData.error === 'string'
              ? errorData.error
              : errorData.error.message || JSON.stringify(errorData.error);
          }
          
          if (errorData.message) {
            return errorData.message;
          }
          
          // Fallback jeśli nie znaleziono standardowych pól błędu
          return `Błąd API (${response.status}): ${JSON.stringify(errorData)}`;
        } catch (e) {
          // Błąd podczas parsowania JSON
          return `Błąd API (${response.status}): Nieprawidłowy format odpowiedzi`;
        }
      }
      
      // Obsługa odpowiedzi typu text
      const textContent = await response.text();
      if (textContent) {
        return `Błąd API (${response.status}): ${textContent}`;
      }
      
      // Domyślny komunikat błędu na podstawie kodu HTTP
      return `Błąd API (${response.status}) podczas operacji: ${context}`;
    } catch (error) {
      // Błąd podczas obsługi odpowiedzi błędu
      return `Błąd podczas przetwarzania odpowiedzi błędu: ${getErrorMessage(error)}`;
    }
  }