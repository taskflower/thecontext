// src/themes/default/widgets/WidgetWrapperApi.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "@/auth/useAuth";
import { useFlow } from "@/core";
import { Loading } from "@/components";
import { RefreshCw } from "lucide-react";

export interface WidgetWrapperApiProps<T> {
  apiEndpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  payloadDataPath?: string;
  responseDataPath?: string; // Ścieżka, gdzie zapisać odpowiedź w kontekście
  responseTransform?: (response: any) => T;
  transformErrors?: (error: any) => string;
  widget: React.ComponentType<{ data: T }>;
  widgetProps?: Record<string, any>;
  mockData?: T; // Opcjonalne dane mockowe do użycia, gdy nie ma autoryzacji
  skipAuth?: boolean; // Opcja pominięcia autoryzacji
}

export default function WidgetWrapperApi<T>({
  apiEndpoint,
  method = "GET",
  payloadDataPath,
  responseDataPath,
  responseTransform = (res) => res,
  transformErrors = (err) => err.message || "Wystąpił nieznany błąd",
  widget: WrappedWidget,
  widgetProps = {},

  skipAuth = false,
}: WidgetWrapperApiProps<T>) {
  const { getToken, user } = useAuth();
  const { get, set } = useFlow();
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Sprawdzamy autentykację tylko jeśli nie pomijamy jej
      if (!skipAuth) {
        const token = await getToken();
        // Sprawdzamy token i użytkownika
        if (!token) {
          console.warn("[WidgetWrapperApi] Brak tokenu autoryzacji");

          throw new Error(
            "Brak tokenu autoryzacji. Zaloguj się, aby korzystać z tej funkcji."
          );
        }

        if (!user) {
          console.warn("[WidgetWrapperApi] Brak zalogowanego użytkownika");

          throw new Error(
            "Użytkownik nie zalogowany. Zaloguj się, aby korzystać z tej funkcji."
          );
        }
      }

      const payload = payloadDataPath ? get(payloadDataPath) : undefined;
      const url = apiEndpoint.startsWith("http")
        ? apiEndpoint
        : `${import.meta.env.VITE_API_URL}${apiEndpoint}`;

      console.log(`[WidgetWrapperApi] Wysyłam zapytanie ${method} do ${url}`);
      console.log(`[WidgetWrapperApi] Payload:`, payload);

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Dodaj token autoryzacji, jeśli skipAuth nie jest true
      if (!skipAuth) {
        const token = await getToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const opts: RequestInit = {
        method,
        headers,
      };

      // Dodaj body tylko dla odpowiednich metod HTTP
      if (method !== "GET" && payload) {
        opts.body = JSON.stringify(payload);
      }

      const response = await fetch(url, opts);

      if (!response.ok) {
        console.error(
          `[WidgetWrapperApi] HTTP Error: ${response.status} ${response.statusText}`
        );

        // Próbujemy odczytać odpowiedź jako JSON, a jeśli się nie uda, używamy tekstu
        const errorBody = await response.json().catch(async () => {
          const text = await response.text();
          return { message: text || `Błąd HTTP ${response.status}` };
        });

        console.error("[WidgetWrapperApi] Error response:", errorBody);
        throw new Error(
          errorBody.message ||
            errorBody.error?.message ||
            `Błąd HTTP ${response.status}`
        );
      }

      let json;
      try {
        json = await response.json();
        console.log(`[WidgetWrapperApi] Otrzymano odpowiedź:`, json);
      } catch (jsonError) {
        console.error(
          "[WidgetWrapperApi] Error parsing JSON response:",
          jsonError
        );
        throw new Error("Błąd parsowania odpowiedzi JSON");
      }

      // Transformacja danych
      let transformed;
      try {
        transformed = responseTransform(json);
        console.log(`[WidgetWrapperApi] Dane po transformacji:`, transformed);
      } catch (transformError: unknown) {
        if (transformError instanceof Error) {
          console.error(
            "[WidgetWrapperApi] Error in responseTransform:",
            transformError
          );
          throw new Error(
            `Błąd transformacji danych: ${transformError.message}`
          );
        } else {
          console.error(
            "[WidgetWrapperApi] Unknown error in responseTransform:",
            transformError
          );
          throw new Error("Unknown error");
        }
      }

      setData(transformed);

      // Zapisz dane w kontekście, jeśli podano ścieżkę
      if (responseDataPath) {
        console.log(
          `[WidgetWrapperApi] Zapisuję dane w kontekście pod ścieżką: ${responseDataPath}`
        );
        set(responseDataPath, transformed);
      }
    } catch (err: any) {
      console.error(`[WidgetWrapperApi] Error:`, err);

      // Bezpieczne wywołanie transformErrors
      try {
        if (typeof transformErrors === "function") {
          setError(transformErrors(err));
        } else {
          setError(err.message || "Wystąpił nieznany błąd");
        }
      } catch (transformErr) {
        console.error(
          "[WidgetWrapperApi] Error in transformErrors:",
          transformErr
        );
        setError(err.message || "Wystąpił nieznany błąd");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Sprawdzamy stan autentykacji tylko raz
    const checkAuth = async () => {
      if (skipAuth) {
        setAuthChecked(true);
        return;
      }

      try {
        setAuthChecked(true);
      } catch (authErr) {
        console.error("[WidgetWrapperApi] Auth check error:", authErr);
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Uruchamiamy pobieranie danych tylko gdy sprawdziliśmy autentykację
    if (authChecked) {
      fetchData();
    }
  }, [apiEndpoint, method, payloadDataPath, responseDataPath, authChecked]);

  // Stan ładowania
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Stan błędu
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
        <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
        <div className="flex space-x-2 mt-4">
          <button
            onClick={fetchData}
            className="px-3 py-1.5 rounded text-sm bg-white text-red-600 border border-red-300 hover:bg-red-50 flex items-center"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            Spróbuj ponownie
          </button>

          {/* Jeśli błąd dotyczy autentykacji, dodajemy przycisk do logowania */}
          {error.toLowerCase().includes("token") ||
          error.toLowerCase().includes("zalog") ? (
            <button
              onClick={() => {
                // Przekieruj do strony logowania lub wywołaj funkcję logowania
                const loginUrl = "/login"; // Dostosuj do swojej aplikacji
                window.location.href = loginUrl;
              }}
              className="px-3 py-1.5 rounded text-sm bg-black text-white hover:bg-gray-800"
            >
              Zaloguj się
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // Jeśli mamy dane, renderujemy widget
  if (data !== null) {
    return <WrappedWidget data={data} {...widgetProps} />;
  }

  // Stan, gdy nie ma danych ani błędu, ale nie ładujemy (może wystąpić na początku)
  return (
    <div className="p-4 bg-gray-50 text-gray-600 rounded border border-gray-200 text-sm">
      <p>Brak danych do wyświetlenia</p>
      <button
        onClick={fetchData}
        className="mt-2 px-3 py-1.5 rounded text-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 flex items-center"
      >
        <RefreshCw className="w-3 h-3 mr-1" />
        Odśwież
      </button>
    </div>
  );
}
