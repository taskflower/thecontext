import { useAuth } from "@/auth/useAuth";
import { useFlow } from "@/core";
import { useState, useEffect } from "react";

export interface ApiStepProps<T> {
  onSubmit: (data: T) => void;
  apiEndpoint: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD";
  payloadDataPath: string;
  responseTransform?: (response: any) => T;
  transformErrors?: (error: any) => string;
  title?: string;
  description?: string;
  showResults?: boolean;
  nodeSlug?: string;
  autoStart?: boolean; // Add this prop like in LlmStep
}

export default function ApiStep<T>({
  onSubmit,
  apiEndpoint,
  method = "POST",
  payloadDataPath,
  responseTransform = (response) => response,
  transformErrors = (error) => error.message || "Wystąpił nieznany błąd",
  title,
  description,
  showResults = false,
  autoStart = false, // Default to false like in LlmStep
}: ApiStepProps<T>) {
  const { getToken, user } = useAuth();
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const executeApiRequest = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = await getToken();
      if (!token || !user) {
        throw new Error(
          token ? "Użytkownik nie zalogowany" : "Brak tokenu autoryzacji"
        );
      }
      const requestData = get(payloadDataPath);
      const apiUrl = apiEndpoint.startsWith("http")
        ? apiEndpoint
        : `${import.meta.env.VITE_API_URL}${apiEndpoint}`;

      const fetchOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };
      if (method !== "GET" && method !== "HEAD") {
        fetchOptions.body = JSON.stringify(requestData);
      }
      const response = await fetch(apiUrl, fetchOptions);

      if (!response.ok) {
        const errInfo = await response
          .json()
          .catch(() => ({
            error: { message: `Błąd HTTP ${response.status}` },
          }));
        throw new Error(
          errInfo.error?.message || `Błąd serwera: ${response.status}`
        );
      }
      const responseData = await response.json();
      if (responseData.success === false) {
        throw new Error(
          responseData.message || "Operacja zakończyła się niepowodzeniem"
        );
      }

      const transformedResponse = responseTransform(responseData);
      setResult(transformedResponse as T);
      onSubmit(transformedResponse as T);
      setIsLoading(false);

    } catch (err: any) {
      const errorMessage = transformErrors(err);
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (autoStart) {
      executeApiRequest();
    }
  }, []);

  const renderResult = () => (
    <div className="p-4 bg-green-50 rounded border border-green-200">
      <h3 className="font-semibold mb-2 text-green-700 text-sm">
        Odpowiedź otrzymana
      </h3>
      <pre className="bg-white p-4 rounded overflow-auto max-h-80 text-xs border border-gray-200 font-mono">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  );

  // Renderowanie błędu
  const renderError = () => (
    <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
      <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
      <p>{error}</p>
      <button
        onClick={() => {
          setError(null);
          executeApiRequest();
        }}
        className="mt-4 px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800"
      >
        Spróbuj ponownie
      </button>
    </div>
  );

  // Renderowanie loadera
  const renderLoader = () => (
    <div className="flex items-center justify-center p-6">
      <div className="w-4 h-4 border-4 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
      <span className="text-gray-900 text-sm">Przetwarzanie...</span>
    </div>
  );

  // Add UI for manual start similar to LlmStep
  const renderStartButton = () => (
    <div className="p-4 bg-gray-50 text-gray-700 rounded border border-gray-200 text-sm">
      <div className="flex items-center gap-3 mb-2">
        <h3 className="font-semibold">
          Kliknij przycisk, aby rozpocząć żądanie API
        </h3>
      </div>
      <button
        onClick={() => {
          setStarted(true);
          executeApiRequest();
        }}
        className="w-full px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800 flex items-center justify-center"
      >
        Rozpocznij
      </button>
    </div>
  );

  return (
    <div className="pt-6">
      {title && <h2 className="text-xl text-gray-900 mb-3">{title}</h2>}
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {isLoading
        ? renderLoader()
        : error
        ? renderError()
        : !started
        ? renderStartButton()
        : result && showResults
        ? renderResult()
        : null}
    </div>
  );
}
