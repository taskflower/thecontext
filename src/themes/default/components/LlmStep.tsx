// src/themes/default/components/LlmStep.tsx
import { ZodType } from "zod";
import { useAuth } from "@/hooks";
import { useLlm } from "../../../core/hooks/useLlm";

type LlmStepProps<T> = {
  schema: ZodType<T>;
  jsonSchema?: any;
  data?: T;
  onSubmit: (data: T) => void;
  userMessage: string;
  systemMessage?: string;
  showResults?: boolean;
  autoStart?: boolean;
  apiEndpoint?: string;
};

export default function LlmStep<T>({
  schema,
  jsonSchema,
  data,
  onSubmit,
  userMessage,
  systemMessage,
  showResults = true,
  autoStart = false,
  apiEndpoint,
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

  if (result && data !== result) {
    onSubmit(result);
  }

  if (!started) {
    return (
      <button
        onClick={() => setStarted(true)}
        className="px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
      >
        Rozpocznij
      </button>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-gray-900 text-sm font-medium">Przetwarzanie...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded border border-red-200 text-sm">
        <h3 className="font-medium mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
        <button
          onClick={startLlmProcess}
          className="mt-4 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (result && showResults) {
    return (
      <div className="p-4 bg-green-50 rounded border border-green-200">
        <h3 className="font-medium mb-2 text-green-700 text-sm">
          Odpowiedź otrzymana
        </h3>
        <pre className="bg-white p-4 rounded overflow-auto max-h-80 text-xs border border-gray-200 font-mono">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 text-gray-700 rounded border border-gray-200 text-sm">
      <h3 className="font-medium mb-2">
        Kliknij przycisk, aby rozpocząć przetwarzanie LLM
      </h3>
      <p className="text-sm">
        Pamietaj że model jezykowy nie zawsze odpowiada zgodnie z naszymi
        oczekiwaniami!
      </p>
      <button
        onClick={startLlmProcess}
        className="mt-4 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
      >
        Rozpocznij
      </button>
    </div>
  );
}