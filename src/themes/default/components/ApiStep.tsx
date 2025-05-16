// src/themes/default/components/ApiStep.tsx
import { useAuth } from "@/auth/useAuth";
import { useFlow } from "@/core";
import { useState, useEffect } from "react";
import Loader from "@/themes/default/commons/Loader";
import ErrorDisplay from "@/themes/default/commons/ErrorDisplay";
import ActionButton from "@/themes/default/commons/ActionButton";

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
  autoStart?: boolean;
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
  autoStart = false,
}: ApiStepProps<T>) {
  const { getToken, user } = useAuth();
  const { get } = useFlow();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [, setShowErrorDetails] = useState(false);
  const [result, setResult] = useState<T | null>(null);
  const [started, setStarted] = useState(autoStart);

  const executeApiRequest = async () => {
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setShowErrorDetails(false);

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
        const errInfo = await response.json().catch(() => ({
          error: { message: `Błąd HTTP ${response.status}` },
        }));

        setErrorDetails({
          status: response.status,
          statusText: response.statusText,
          details: errInfo,
        });

        throw new Error(
          errInfo.error?.message || `Błąd serwera: ${response.status}`
        );
      }
      const responseData = await response.json();
      if (responseData.success === false) {
        setErrorDetails(responseData);
        throw new Error(
          responseData.error?.message ||
            responseData.message ||
            "Operacja zakończyła się niepowodzeniem"
        );
      }

      const transformedResponse = responseTransform(responseData);
      setResult(transformedResponse as T);
      onSubmit(transformedResponse as T);
      setIsLoading(false);
    } catch (err: any) {
      const errorMessage = transformErrors(err);
      setError(errorMessage);
      if (!errorDetails) {
        setErrorDetails(err);
      }
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

  return (
    <div className="pt-6">
      {title && <h2 className="text-xl text-gray-900 mb-3">{title}</h2>}
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorDisplay
          error={error}
          details={errorDetails}
          onRetry={executeApiRequest}
        />
      ) : !started ? (
        <ActionButton
          label="Rozpocznij"
          onClick={() => {
            setStarted(true);
            executeApiRequest();
          }}
        />
      ) : result && showResults ? (
        renderResult()
      ) : null}
    </div>
  );
}
