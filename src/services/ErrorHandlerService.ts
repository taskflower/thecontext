/**
 * ErrorHandlerService - Centralizuje obsługę błędów w aplikacji
 * Zapewnia spójną obsługę i prezentację błędów
 */
// Struktura błędu z backendu - reeksportowana dla wygody użycia
export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

// Kody błędów z backendu
export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  INSUFFICIENT_TOKENS = 'INSUFFICIENT_TOKENS',
  INVALID_INPUT = 'INVALID_INPUT',
  NOT_FOUND = 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  FIREBASE_AUTH_ERROR = 'FIREBASE_AUTH_ERROR',
  FIREBASE_DB_ERROR = 'FIREBASE_DB_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  PLUGIN_ERROR = 'PLUGIN_ERROR',
}

// Komponenty do wyświetlania błędów
export interface ErrorHandlerComponents {
  // Funkcja pokazująca toast z błędem
  showToast?: (error: ErrorResponse) => void;
  
  // Funkcja przekierowująca do strony logowania
  redirectToLogin?: () => void;
  
  // Funkcja przekierowująca do strony zakupu tokenów
  redirectToTokenPurchase?: () => void;
}

// Opcje obsługi błędów
export interface ErrorHandlerOptions {
  showConsoleLog?: boolean; // Czy pokazywać błędy w konsoli
  throwError?: boolean;     // Czy rzucać wyjątek dalej
  useToast?: boolean;       // Czy pokazywać toast z błędem
}

/**
 * Domyślne komunikaty błędów dla znanych kodów
 */
const DEFAULT_ERROR_MESSAGES: Record<string, string> = {
  [ErrorCode.UNAUTHORIZED]: 'Wymagane zalogowanie do wykonania tej akcji',
  [ErrorCode.INSUFFICIENT_TOKENS]: 'Niewystarczająca liczba tokenów',
  [ErrorCode.INVALID_INPUT]: 'Nieprawidłowe dane wejściowe',
  [ErrorCode.NOT_FOUND]: 'Nie znaleziono zasobu',
  [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Przekroczono limit zapytań, spróbuj ponownie później',
  [ErrorCode.FIREBASE_AUTH_ERROR]: 'Błąd autoryzacji',
  [ErrorCode.FIREBASE_DB_ERROR]: 'Błąd bazy danych',
  [ErrorCode.INTERNAL_ERROR]: 'Wystąpił nieoczekiwany błąd',
  [ErrorCode.SERVICE_UNAVAILABLE]: 'Usługa jest obecnie niedostępna',
  [ErrorCode.PLUGIN_ERROR]: 'Błąd pluginu',
};

/**
 * Klasa obsługi błędów
 */
class ErrorHandlerService {
  private components: ErrorHandlerComponents = {};

  /**
   * Ustawia komponenty do obsługi błędów
   */
  setComponents(components: ErrorHandlerComponents) {
    this.components = { ...this.components, ...components };
  }

  // Funkcje pomocnicze do obsługi komponentów

  /**
   * Sprawdza, czy obiekt jest typu ErrorResponse
   */
  isErrorResponse(error: unknown): error is ErrorResponse {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      'message' in error
    );
  }

  /**
   * Konwertuje różne typy błędów do standardowego formatu ErrorResponse
   */
  normalizeError(error: unknown): ErrorResponse {
    // Jeśli to już jest ErrorResponse, zwróć
    if (this.isErrorResponse(error)) {
      return error;
    }

    // Jeśli to obiekt Error
    if (error instanceof Error) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: error.message,
        details: { stack: error.stack }
      };
    }

    // Jeśli to string
    if (typeof error === 'string') {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: error
      };
    }

    // Ogólny przypadek, gdy nie znamy typu błędu
    return {
      code: ErrorCode.INTERNAL_ERROR,
      message: 'Wystąpił nieoczekiwany błąd',
      details: { originalError: error }
    };
  }

  /**
   * Pobiera przyjazną dla użytkownika wiadomość dla kodu błędu
   */
  getUserFriendlyMessage(error: ErrorResponse): string {
    return DEFAULT_ERROR_MESSAGES[error.code] || error.message;
  }

  /**
   * Główna metoda obsługi błędów
   */
  handleError(
    error: unknown, 
    options: ErrorHandlerOptions = { 
      showConsoleLog: true,
      throwError: false,
      useToast: true 
    }
  ): ErrorResponse {
    const normalizedError = this.normalizeError(error);
    
    // Logowanie do konsoli, jeśli włączone
    if (options.showConsoleLog) {
      console.error('Error handled by ErrorHandlerService:', normalizedError);
    }
    
    // Obsługa specyficznych typów błędów
    this.handleSpecificError(normalizedError);
    
    // Pokazanie toasta, jeśli włączone
    if (options.useToast && this.components.showToast) {
      this.components.showToast(normalizedError);
    }
    
    // Rzucenie wyjątku dalej, jeśli wymagane
    if (options.throwError) {
      throw new Error(normalizedError.message);
    }
    
    return normalizedError;
  }

  /**
   * Obsługa specyficznych typów błędów
   */
  private handleSpecificError(error: ErrorResponse): void {
    switch (error.code) {
      case ErrorCode.UNAUTHORIZED:
        // Możemy pokazać dialog logowania, ale nie przekierowujemy automatycznie
        console.log('Błąd autoryzacji:', error.message);
        break;
        
      case ErrorCode.INSUFFICIENT_TOKENS:
        // Możemy pokazać dialog zachęcający do zakupu tokenów
        console.log('Niewystarczająca liczba tokenów:', error.message);
        break;
        
      case ErrorCode.RATE_LIMIT_EXCEEDED:
        // Możemy pokazać informację, kiedy użytkownik może spróbować ponownie
        const retryAfter = error.details?.retryAfter;
        console.log(`Przekroczono limit zapytań. Spróbuj ponownie za ${retryAfter || 'kilka minut'}`);
        break;
        
      // Inne specyficzne przypadki...
    }
  }

  /**
   * Obsługa błędów autoryzacji
   */
  handleAuthError(error: unknown): ErrorResponse {
    const normalizedError = this.normalizeError(error);
    
    // Logowanie
    console.error('Auth error:', normalizedError);
    
    // Obsługa specyficznych przypadków
    if (this.components.redirectToLogin && normalizedError.code === ErrorCode.UNAUTHORIZED) {
      // Przekierowanie do logowania można aktywować ręcznie
      console.log('Można przekierować do logowania');
    }
    
    return normalizedError;
  }

  /**
   * Obsługa błędów związanych z AI
   */
  handleAIError(error: unknown, serviceName: string): ErrorResponse {
    const normalizedError = this.normalizeError(error);
    
    // Dodanie informacji o usłudze AI
    normalizedError.details = {
      ...normalizedError.details,
      aiService: serviceName
    };
    
    // Specjalna obsługa dla braku tokenów w kontekście AI
    if (normalizedError.code === ErrorCode.INSUFFICIENT_TOKENS && 
        this.components.redirectToTokenPurchase) {
      console.log('Można przekierować do zakupu tokenów');
    }
    
    // Logowanie
    console.error(`AI error (${serviceName}):`, normalizedError);
    
    return normalizedError;
  }

  /**
   * Tworzy nowy obiekt błędu
   */
  createError(
    code: ErrorCode,
    message: string,
    details?: Record<string, unknown>
  ): ErrorResponse {
    return { code, message, details };
  }
}

// Singleton
const errorHandler = new ErrorHandlerService();
export default errorHandler;