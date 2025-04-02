/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/plugins/ApiServicePlugin.tsx
import { useState, useEffect } from "react";
import { PluginComponentWithSchema } from "../modules/plugins/types";
import { Send, Loader2, User, Layers } from "lucide-react";

import { PluginAuthAdapter } from "../services/PluginAuthAdapter";
import { LlmService } from "../services/LlmService";
import { AuthUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { useAppStore } from "../modules/store";
import ErrorDisplay from "@/components/ui/error-display";

// Define the API service data structure
interface ApiServiceData {
  buttonText?: string;
  assistantMessage?: string;
  fillUserInput?: boolean;
  apiUrl?: string;
  // JSON response options
  useJsonResponse?: boolean;
  contextJsonKey?: string; // Klucz w kontekście do znalezienia schematu JSON
}

// Define the error structure from backend
interface ApiErrorResponse {
  code: string;
  message: string;
  details?: Record<string, unknown> | null;
}

// Define the API response structure
interface ApiResponse {
  success: boolean;
  data?: {
    success: boolean;
    data?: {
      message: {
        content: string;
        parsedJson?: any;
      };
    };
  };
  error?: ApiErrorResponse | string;
}

const ApiServicePlugin: PluginComponentWithSchema<ApiServiceData> = ({
  data,
  appContext,
}) => {
  // Definicja wartości domyślnych wewnątrz komponentu
  const defaultOptions = {
    buttonText: "Analizuj odpowiedz",
    assistantMessage: "This is the message that will be sent to the API.",
    fillUserInput: false,
    apiUrl: "api/v1/services/chat/completion",
    useJsonResponse: false,
    contextJsonKey: "",
  };

  // Połączenie dostarczonych danych z domyślnymi
  const options: ApiServiceData = {
    ...defaultOptions,
    ...(data as ApiServiceData),
  };

  // Pobranie kontekstu autoryzacji z aplikacji, jeśli dostępny
  const auth = useAuth();

  // Pobierz funkcję getContextItems z useAppStore, aby udostępnić ją dla LlmService
  const getContextItems = useAppStore((state) => state.getContextItems);

  // Rozszerzony kontekst aplikacji z dodatkową funkcją getContextItems
  const enhancedAppContext: any = {
    ...appContext,
    authContext: auth,
    getContextItems: getContextItems,
  };

  // Inicjalizacja adaptera autoryzacji (tylko raz)
  const [authAdapter] = useState(
    () => new PluginAuthAdapter(enhancedAppContext)
  );

  // Usunięcie stanu dla LlmService - zamiast tego tworzymy funkcję do pozyskiwania świeżej instancji
  const getLlmService = () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL;

    // Konfiguracja LlmService
    const serviceOptions: any = {
      apiUrl: options.apiUrl,
      apiBaseUrl: apiBaseUrl,
    };

    // Dodanie kontekstowego klucza JSON, jeśli używany
    if (options.useJsonResponse && options.contextJsonKey) {
      serviceOptions.contextJsonKey = options.contextJsonKey;
      console.log(
        `Using JSON response format with context key: ${options.contextJsonKey}`
      );

      // Debug: Sprawdź, czy element kontekstowy istnieje
      const contextItems = getContextItems();
      const contextItem = contextItems.find(
        (item) => item.title === options.contextJsonKey
      );
      if (contextItem) {
        console.log(
          `Found context item with title "${options.contextJsonKey}":`,
          contextItem
        );
      } else {
        console.warn(
          `Context item with title "${options.contextJsonKey}" not found!`
        );
      }
    }

    return new LlmService(authAdapter, serviceOptions);
  };

  // Stan do obsługi żądania API
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_apiResponse, setApiResponse] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_hasError, setHasError] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [, setAuthAttempts] = useState(authAdapter.getAuthAttempts());
  // Zmieniliśmy nazwę stanu na apiError, aby odzwierciedlało to wszystkie typy błędów, nie tylko autoryzacji
  const [apiError, setApiError] = useState<ApiErrorResponse | null>(null);

  // Pobranie wartości z kontekstu aplikacji
  const currentNodeId = appContext?.currentNode?.id;
  const assistantMessage =
    appContext?.currentNode?.assistantMessage || options.assistantMessage;

  // Rzutowanie metod z appContext
  const { addNodeMessage, moveToNextNode } = (appContext || {}) as any;

  // Załadowanie danych użytkownika po zamontowaniu komponentu
  useEffect(() => {
    const loadAuth = async () => {
      setAuthLoading(true);
      try {
        // Najpierw próba pobrania użytkownika z kontekstu autoryzacji
        if (auth?.currentUser) {
          setCurrentUser(auth.currentUser);
        } else {
          // Alternatywnie z adaptera
          const user = await authAdapter.getCurrentUser();
          setCurrentUser(user);
        }

        setAuthAttempts(authAdapter.getAuthAttempts());
      } catch (error) {
        console.error("Error loading auth:", error);
      } finally {
        setAuthLoading(false);
      }
    };

    loadAuth();
  }, [auth, authAdapter]);

  // Funkcja wywołania API
  const callApi = async () => {
    if (!currentNodeId) return;

    setIsLoading(true);
    setApiResponse(null);
    setHasError(false);
    setApiError(null); // Resetuj błąd przy każdym nowym żądaniu

    try {
      // Pobranie bieżącego ID użytkownika lub użycie anonimowego
      const userId = currentUser?.uid || "anonymous";

      // Utworzenie nowej instancji LlmService
      const llmService = getLlmService();

      // Logging requested URL
      console.log(`Sending request to: ${options.apiUrl}`);

      // Przygotowanie parametrów zapytania
      const requestParams: any = {
        message: assistantMessage || "",
        userId,
      };

      // Wysłanie żądania za pomocą LlmService
      const response = await llmService.sendRequest(requestParams) as ApiResponse;
      
      // BARDZO WAŻNE: Natychmiast sprawdź czy jest błąd i ustaw go
      if (!response.success && response.error) {
        if (typeof response.error === 'object') {
          setApiError(response.error as ApiErrorResponse);
        } else if (typeof response.error === 'string') {
          setApiError({
            code: "INTERNAL_ERROR",
            message: response.error,
            details: null
          });
        }
        setHasError(true);
      }

      const formattedResponse = JSON.stringify(response, null, 2);
      setApiResponse(formattedResponse);

      if (
        response.success &&
        response.data?.success &&
        response.data?.data?.message
      ) {
        // Wyodrębnienie zawartości - może być zarówno przeanalizowany obiekt JSON, jak i zawartość tekstowa
        let assistantContent = response.data.data.message.content;

        // Sprawdzenie przeanalizowanego JSON, jeśli używamy formatu odpowiedzi JSON
        if (options.useJsonResponse && response.data.data.message.parsedJson) {
          assistantContent = JSON.stringify(
            response.data.data.message.parsedJson,
            null,
            2
          );
        }

        // Aktualizacja wiadomości użytkownika o zawartość z API, jeśli włączone
        if (options.fillUserInput && appContext?.updateNodeUserPrompt) {
          appContext.updateNodeUserPrompt(currentNodeId, assistantContent);
        }

        // Dodanie odpowiedzi API do konwersacji
        if (addNodeMessage) {
          const messageType = options.useJsonResponse ? "json" : "text";
          addNodeMessage(
            currentNodeId,
            `API Response (${messageType}):\n\`\`\`json\n${formattedResponse}\n\`\`\``
          );
        }

        // Przejście do następnego węzła, jeśli nie wypełniamy wpisu użytkownika
        if (!options.fillUserInput && moveToNextNode) {
          moveToNextNode(currentNodeId);
        }
      } else {
        // Uwaga: główna obsługa błędu jest już wykonana na początku, 
        // więc tutaj tylko logujemy i kontynuujemy logikę dodawania komunikatu
        console.log("Błędna odpowiedź bez wiadomości");
        
        // Jeśli jeszcze nie mamy błędu, ustaw jakiś domyślny
        if (!apiError) {
          setApiError({
            code: "RESPONSE_PARSING_ERROR",
            message: "Nie udało się przetworzyć odpowiedzi z API",
            details: { response: JSON.stringify(response) }
          });
        }
        
        setHasError(true);

        // Dodanie ostrzeżenia do konwersacji
        if (addNodeMessage) {
          let errorMsg = "Warning: Could not extract content from API response.";
          
          // Dodaj informację o błędzie, jeśli jest dostępna
          if (apiError) {
            errorMsg = `Warning: ${apiError.code} - ${apiError.message}`;
          } else if (response.error) {
            if (typeof response.error === 'object' && response.error.message) {
              errorMsg = `Warning: ${response.error.message}`;
            } else if (typeof response.error === 'string') {
              errorMsg = `Warning: ${response.error}`;
            }
          }
            
          addNodeMessage(currentNodeId, errorMsg);
        }
      }
    } catch (error) {
      console.error("API error:", error);
      
      // Sprawdź, czy to obiekt błędu z kodem
      if (
        typeof error === 'object' && 
        error !== null && 
        'code' in error
      ) {
        setApiError(error as ApiErrorResponse);
      }
      
      setApiResponse(
        `Error: ${error instanceof Error ? error.message : String(error)}`
      );
      setHasError(true);

      // Dodanie błędu do konwersacji
      if (addNodeMessage) {
        addNodeMessage(
          currentNodeId,
          `API Error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Funkcja obsługi logowania
  const handleLogin = () => {
    alert('TODO')
  };

  return (
    <div className="mt-6 space-y-5">
      {/* Komunikat błędu API - używamy komponentu ErrorDisplay */}
      {apiError && (
        <ErrorDisplay 
          error={apiError}
          variant="error"
          className="mb-4"
          onClose={() => setApiError(null)}
          onPrimaryAction={apiError.code === 'UNAUTHORIZED' ? handleLogin : undefined}
          primaryActionLabel={apiError.code === 'UNAUTHORIZED' ? "Zaloguj się" : undefined}
          secondaryActionLabel="Zamknij"
          onSecondaryAction={() => setApiError(null)}
        />
      )}

      {/* Przycisk wywołania API */}
      <div className="space-y-3">
        <div className="space-y-3 relative">
          <button
            onClick={callApi}
            disabled={isLoading || authLoading}
            className={`p-6 rounded-md transition-colors text-base font-medium w-full flex items-center justify-center ${
              isLoading || authLoading
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Ładowanie...
              </>
            ) : (
              <>
                {options.buttonText}
                <Send className="ml-2 h-5 w-5" />
              </>
            )}
          </button>
          <div className="absolute -bottom-2 -right-2 flex gap-1">
          {options.useJsonResponse && options.contextJsonKey && (
            <div className="w-6 h-6 rounded-full bg-white p-1">
              <Layers className="w-4 h-4 text-black"/>
            </div>
          )}
          {/* Informacja o użytkowniku */}
          {!authLoading && currentUser && (
            <div className="w-6 h-6 rounded-full bg-white p-1">
              <User className="w-4 h-4 text-black"/>
            </div>
          )}
          </div>
        </div>
      </div>

     
    </div>
  );
};

// Tworzenie stabilnej referencji dla domyślnych opcji schematu
const schemaDefaults = {
  buttonText: "Send Request",
  assistantMessage: "This is the message that will be sent to the API.",
  fillUserInput: false,
  apiUrl: "api/v1/services/chat/completion",
  useJsonResponse: false,
  contextJsonKey: "",
};

// Określenie, że ten plugin powinien zastąpić widok asystenta
ApiServicePlugin.pluginSettings = {
  // replaceHeader: true,
  // replaceAssistantView: true,
};

// Dodanie schematu opcji dla edytora pluginu
ApiServicePlugin.optionsSchema = {
  buttonText: {
    type: "string",
    label: "Button Text",
    default: schemaDefaults.buttonText,
    description: "Text to display on the API call button",
  },
  assistantMessage: {
    type: "string",
    label: "Default Assistant Message",
    default: schemaDefaults.assistantMessage,
    description: "Default message to send if node has no assistant message",
  },
  fillUserInput: {
    type: "boolean",
    label: "Fill User Input",
    default: schemaDefaults.fillUserInput,
    description: "Fill the user input with API response content",
  },
  apiUrl: {
    type: "string",
    label: "API Endpoint Path",
    default: schemaDefaults.apiUrl,
    description: "Path to the API endpoint (appended to API base URL)",
  },
  useJsonResponse: {
    type: "boolean",
    label: "Force JSON Response",
    default: schemaDefaults.useJsonResponse,
    description: "Request response in JSON format",
  },
  contextJsonKey: {
    type: "string",
    label: "Context JSON Key",
    default: schemaDefaults.contextJsonKey,
    description: "Tytuł elementu kontekstowego zawierającego schemat JSON",
    conditional: {
      field: "useJsonResponse",
      value: true,
    },
  },
};

export default ApiServicePlugin;