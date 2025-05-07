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
        className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-gray-900 text-white hover:bg-gray-800"
      >
        Rozpocznij
      </button>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span className="text-gray-900 font-medium">Przetwarzanie...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-md border border-red-200">
        <h3 className="font-semibold mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
        <button 
          onClick={startLlmProcess}
          className="mt-4 px-5 py-3 rounded-md transition-colors text-base font-medium bg-gray-900 text-white hover:bg-gray-800"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  
  if (result && showResults) {
    return (
      <div className="p-6 bg-green-50 rounded-md border border-green-200">
        <h3 className="font-semibold mb-2 text-green-800">Odpowiedź otrzymana</h3>
        <pre className="bg-white p-4 rounded-md shadow-sm overflow-auto max-h-80 text-sm border border-gray-200">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }
  
  return (
    <div 
      onClick={startLlmProcess}
      className="p-6 bg-gray-50 text-gray-700 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
    >
      Kliknij, aby rozpocząć przetwarzanie
    </div>
  );
}