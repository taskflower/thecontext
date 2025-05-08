// src/themes/clean/components/LlmStep.tsx
import { ZodType } from "zod";
import { useLlm } from "../../../core/hooks/useLlm";
import { useAuth } from "@/auth/useAuth";

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
  
  const { 
    isLoading, 
    error, 
    result, 
    started, 
    startLlmProcess,
    setStarted
  } = useLlm<T>({
    schema,
    jsonSchema,
    userMessage,
    systemMessage,
    autoStart,
    apiEndpoint,
    getToken,
    user
  });

  if (result && data !== result) {
    onSubmit(result);
  }

  if (!started) {
    return (
      <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <p className="mb-6 text-slate-600">Kliknij przycisk, aby rozpocząć przetwarzanie LLM</p>
          <button 
            onClick={() => setStarted(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Rozpocznij
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-indigo-600 font-medium">Przetwarzanie...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-md">
          <h3 className="font-semibold text-rose-700 mb-2">Wystąpił błąd</h3>
          <p className="text-rose-600 mb-4">{error}</p>
          <button 
            onClick={startLlmProcess}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
          >
            Spróbuj ponownie
          </button>
        </div>
      </div>
    );
  }

  if (result && showResults) {
    return (
      <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
        <div className="py-4">
          <h3 className="font-semibold text-emerald-700 mb-4">Odpowiedź otrzymana</h3>
          <pre className="p-4 bg-sky-50 border border-sky-200 rounded-md text-sm overflow-auto max-h-80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 mx-auto bg-white rounded-lg border border-sky-200 shadow-sm p-6">
      <div className="p-4 bg-sky-50 text-slate-700 rounded-md border border-sky-200 text-sm">
        <h3 className="font-medium mb-2">
          Kliknij przycisk, aby rozpocząć przetwarzanie LLM
        </h3>
        <p className="text-sm mb-4">
          Pamietaj że model jezykowy nie zawsze odpowiada zgodnie z naszymi
          oczekiwaniami!
        </p>
        <button
          onClick={startLlmProcess}
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-full shadow-sm font-medium hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
        >
          Rozpocznij
        </button>
      </div>
    </div>
  );
}