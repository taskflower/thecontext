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
  
  // Używamy hooka useLlm z core
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

  // Gdy mamy rezultat i jeszcze nie wysłaliśmy go, wywołujemy onSubmit
  if (result && data !== result) {
    onSubmit(result);
  }

  // Renderowanie UI
  if (!started) {
    return (
      <button 
        onClick={() => setStarted(true)}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Rozpocznij
      </button>
    );
  }
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
        <span>Przetwarzanie...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <h3 className="font-bold mb-2">Wystąpił błąd</h3>
        <p>{error}</p>
        <button 
          onClick={startLlmProcess}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Spróbuj ponownie
        </button>
      </div>
    );
  }
  
  if (result && showResults) {
    return (
      <div className="p-4 bg-green-50 rounded">
        <h3 className="font-bold mb-2 text-green-700">Odpowiedź otrzymana</h3>
        <pre className="bg-white p-4 rounded overflow-auto max-h-80 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    );
  }
  
  return (
    <div 
      onClick={startLlmProcess}
      className="p-4 bg-blue-50 text-blue-700 rounded cursor-pointer hover:bg-blue-100 transition-colors"
    >
      Kliknij, aby rozpocząć przetwarzanie
    </div>
  );
}