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

  if (!started) {
    return (
      <button 
        onClick={() => setStarted(true)}
        className="px-4 py-2 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
      >
        Rozpocznij
      </button>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-4 border-slate-800 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-slate-800 font-medium">Przetwarzanie...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 text-red-700">
        <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
        <button 
          onClick={startLlmProcess}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-md font-medium hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  
  if (result && showResults) {
    return (
      <div className="p-6">
        <h3 className="font-semibold mb-2 text-green-800">Odpowiedź otrzymana</h3>
        <pre className="p-4 rounded-md max-h-80 text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }
  
  return (
    <div 
      onClick={startLlmProcess}
      className="p-6 text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
    >
      Kliknij, aby rozpocząć przetwarzanie
    </div>
  );
}