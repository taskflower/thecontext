// src/themes/clean/components/LlmStep.tsx
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

  return (
    <div className="mt-3 mx-auto bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      {!started ? (
        <div className="flex flex-col items-center justify-center py-8">
          <p className="mb-6 text-slate-600">Kliknij przycisk, aby rozpocząć przetwarzanie LLM</p>
          <button 
            onClick={() => setStarted(true)}
            className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-sm font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Rozpocznij
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mr-3"></div>
          <span className="text-slate-700 font-medium">Przetwarzanie...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-semibold text-red-700 mb-2">Wystąpił błąd</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={startLlmProcess}
            className="px-4 py-2 bg-slate-800 text-white rounded-md shadow-sm font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Spróbuj ponownie
          </button>
        </div>
      ) : result && showResults ? (
        <div className="py-4">
          <h3 className="font-semibold text-green-700 mb-4">Odpowiedź otrzymana</h3>
          <pre className="p-4 bg-slate-50 border border-slate-200 rounded-md text-sm overflow-auto max-h-80">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      ) : (
        <div 
          onClick={startLlmProcess}
          className="p-6 bg-slate-50 border border-slate-200 rounded-md text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
        >
          Kliknij, aby rozpocząć przetwarzanie
        </div>
      )}
    </div>
  );
}