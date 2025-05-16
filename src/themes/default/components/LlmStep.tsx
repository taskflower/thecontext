// src/themes/default/components/LlmStep.tsx
import { useAuth } from "@/auth/useAuth";
import { useLlm } from "@/core";
import { LlmStepProps } from "@/themes/themeTypes";
import { Sparkles } from "lucide-react";
import { useEffect } from "react";
import Loader from "@/themes/default/commons/Loader";
import ErrorDisplay from "@/themes/default/commons/ErrorDisplay";
import ActionButton from "@/themes/default/commons/ActionButton";

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

  const { isLoading, error, result, started, startLlmProcess } =
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
      {title && <h2 className="text-xl text-gray-900 mb-3">{title}</h2>}
      {description && (
        <p className="text-gray-600 mb-6 text-sm">{description}</p>
      )}

      <div className="h-3"></div>

      {!started ? (
        <ActionButton
          label="Rozpocznij przetwarzanie"
          icon={<Sparkles className="w-5 h-5 mr-2" />}
          onClick={startLlmProcess}
          variant="full"  // Przyciski rozciągnięte
        />
      ) : isLoading ? (
        <Loader />
      ) : error ? (
        <ErrorDisplay error={error} details={error} onRetry={startLlmProcess} />
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
          <p className="text-sm mb-4">
            Warto pamiętać, że model językowy może czasem odpowiadać w sposób
            nieoczekiwany.
          </p>
          <ActionButton
            label="Rozpocznij przetwarzanie"
            icon={<Sparkles className="w-5 h-5 mr-2" />}
            onClick={startLlmProcess}
            variant="full-outline"  // Przyciski rozciągnięte

          />
        </div>
      )}
    </div>
  );
}
