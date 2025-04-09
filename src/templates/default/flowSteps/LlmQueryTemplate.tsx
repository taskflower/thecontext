// src/templates/flowSteps/LlmQueryTemplate.tsx
import React, { useState, useEffect } from 'react';
import { FlowStepProps } from 'template-registry-module';
import { useAuth } from '@/hooks/useAuth';

// Rozszerzony interfejs dla FlowStepProps, który uwzględnia scenario i rozszerzony node
interface ExtendedFlowStepProps extends Omit<FlowStepProps, 'node'> {
  node: EnhancedNodeData;
  scenario?: EnhancedScenario;
}

const LlmQueryTemplate: React.FC<ExtendedFlowStepProps> = ({ 
  node, 
  scenario,
  onSubmit, 
  onPrevious, 
  isLastNode,
  contextItems = []
}) => {
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const { getToken, user } = useAuth();
  
  useEffect(() => {
    // Sprawdź na początku, czy mamy token i użytkownika
    const checkAuth = async () => {
      const token = await getToken();
      setDebugInfo(`Token dostępny: ${!!token}, User dostępny: ${!!user}, User ID: ${user?.uid || 'brak'}`);
    };
    
    checkAuth();
  }, [getToken, user]);

  const sendMessageToGemini = async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Pobierz aktualny token JWT
      const token = await getToken();
      
      if (!token) {
        throw new Error('Token autoryzacyjny niedostępny. Zaloguj się ponownie.');
      }
      
      if (!user) {
        throw new Error('Użytkownik nie jest zalogowany. Zaloguj się ponownie.');
      }
      
      // Przygotuj wiadomości do wysłania zgodnie z wymaganą kolejnością
      const messages = [];
      
      // 1. Dodaj wiadomość systemową, jeśli węzeł ma ustawioną flagę includeSystemMessage
      // i scenariusz ma zdefiniowaną wiadomość systemową
      if (node.includeSystemMessage && scenario?.systemMessage) {
        messages.push({
          role: "system",
          content: scenario.systemMessage
        });
      }
      
      // 2. Dodaj poprzednie wiadomości użytkownika i asystenta (jeśli istnieją)
      // Najpierw musi być wiadomość użytkownika, jeśli asystent już wcześniej odpowiedział
      if (node.assistantMessage && node.assistantMessage.trim() !== '') {
        // Dodaj fikcyjne zapytanie użytkownika, które mogło prowadzić do tej odpowiedzi asystenta
        messages.push({
          role: "user",
          content: "Previous question"
        });
        
        // Dodaj wiadomość asystenta
        messages.push({
          role: "assistant",
          content: node.assistantMessage
        });
      }
      
      // 3. Dodaj bieżącą wiadomość użytkownika
      messages.push({
        role: "user",
        content: message
      });
      
      console.log("Prepared messages:", messages);
      
      // Format danych według wymaganej struktury
      const payload = {
        messages: messages,
        userId: user.uid
      };
      
      setDebugInfo(`Wysyłanie do: ${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`);
      
      // Wysyłanie żądania do Gemini API z tokenem JWT w nagłówku Authorization
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Błąd odpowiedzi:", errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(
            errorData.error?.message || 
            `Żądanie API zakończone błędem: ${response.status}`
          );
        } catch (e) {
          // Jeśli nie możemy sparsować JSON, użyj surowego tekstu
          throw new Error(`Żądanie API zakończone błędem: ${response.status} - ${errorText.substring(0, 100)}...`);
        }
      }
      
      const responseData = await response.json();
      console.log("Dane odpowiedzi:", responseData);
      
      // Przekaż zarówno wejście użytkownika, jak i odpowiedź AI do handlera onSubmit
      onSubmit(JSON.stringify({
        userInput: message,
        aiResponse: responseData
      }));
      
      // Wyczyść pole wprowadzania
      setUserInput('');
    } catch (err) {
      console.error('Pełny błąd:', err);
      setError(err instanceof Error ? err.message : 'Wystąpił nieznany błąd');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (userInput.trim() === '') return;
    sendMessageToGemini(userInput);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-2">Asystent AI</h2>
            <p className="text-gray-700">
              {node.assistantMessage || 'W czym mogę pomóc?'}
            </p>
          </div>
        </div>
      </div>

      {node.includeSystemMessage && scenario?.systemMessage && (
        <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
          <div className="flex items-start space-x-3">
            <div className="bg-amber-100 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-medium text-amber-800 mb-1">System Message</h3>
              <p className="text-xs text-amber-700">
                {scenario.systemMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {debugInfo && (
        <div className="bg-gray-100 p-2 text-xs text-gray-800 rounded border border-gray-200">
          <p>Debug: {debugInfo}</p>
        </div>
      )}

      <div className="space-y-2">
        <textarea 
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={4}
          placeholder="Zapytaj asystenta AI..."
        />

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            Błąd: {error}
          </div>
        )}

        <div className="flex justify-between items-center">
          <button 
            onClick={onPrevious}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
          >
            Wstecz
          </button>
          <button 
            onClick={handleSubmit}
            disabled={isLoading || userInput.trim() === ''}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded flex items-center space-x-2 disabled:bg-blue-300"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Przetwarzanie...</span>
              </>
            ) : (
              <span>{isLastNode ? 'Zakończ' : 'Wyślij i Kontynuuj'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LlmQueryTemplate;