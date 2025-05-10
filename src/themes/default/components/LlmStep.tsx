// src/themes/default/components/LlmStep.tsx

import { useAuth } from "@/auth/useAuth";
import { useLlm } from "@/core";
import { LlmStepProps } from "@/themes/themeTypes";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";

export default function LlmStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  userMessage,
  systemMessage,
  showResults = false,
  autoStart = false,
  apiEndpoint,
  title, 
  description,
}: LlmStepProps<T>) {
  const { getToken, user } = useAuth();

  const { isLoading, error, result, started, startLlmProcess, setStarted } =
    useLlm<T>({
      schema,
      jsonSchema,
      userMessage,
      systemMessage,
      autoStart,
      apiEndpoint,
      getToken,
      user,
    });

  useEffect(() => {
    if (result && data !== result) {
      onSubmit(result);
    }
  }, [result, data, onSubmit]);

  return (
    <div className="pt-6">
      {/* Dodane wyświetlanie tytułu i opisu */}
      {title && (
        <h2 className="text-xl text-gray-900 mb-3">{title}</h2>
      )}

      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      <div className="h-3"></div>

      {!started ? (
        <button
          onClick={() => setStarted(true)}
          className="px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800"
        >
          Rozpocznij
        </button>
      ) : isLoading ? (
        <div className="flex items-center justify-center p-6">
          <div className="w-4 h-4 border-4 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
          <span className="text-gray-900 text-sm">
            Przetwarzanie...
          </span>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
          <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
          <p>{error}</p>
          <button
            onClick={startLlmProcess}
            className="mt-4 px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : result && !showResults ? null : result && showResults ? (
        <div className="p-4 bg-green-50 rounded border border-green-200">
          <h3 className="font-semibold mb-2 text-green-700 text-sm">
            Odpowiedź otrzymana
          </h3>
          <pre className="bg-white p-4 rounded overflow-auto max-h-80 text-xs border border-gray-200 font-mono">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="p-4 bg-gray-50 text-gray-700 rounded border border-gray-200 text-sm">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">
              Kliknij przycisk, aby rozpocząć przetwarzanie LLM
            </h3>
          </div>

          <p className="text-sm mb-4">
            Warto pamiętać, że model językowy może czasem odpowiadać w sposób
            nieoczekiwany.
          </p>

          <button
            onClick={startLlmProcess}
            className="w-full px-5 py-2.5 rounded transition-colors text-sm font-semibold bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Rozpocznij przetwarzanie
          </button>
        </div>
      )}
    </div>
  );
}
