// src/templates/default/flowSteps/ApiCallTemplate.tsx
import React, { useEffect, useState } from 'react';


// Przykładowy interfejs dla atrybutów przekazywanych do tego kroku

const ApiCallTemplate: React.FC<any> = ({
  node,
  context,
  updateContext,
  // addMessage, // Możliwość dodawania wiadomości do czatu
  // setInputDisabled, // Możliwość blokowania interfejsu podczas ładowania
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<any>(null);

  const attrs = node.attrs;
  const payload = attrs.payloadDataPath ? context[attrs.payloadDataPath] : undefined; // Pobierz payload z kontekstu

  useEffect(() => {
    // Prosta symulacja wywołania API po zamontowaniu komponentu
    // W realnej aplikacji: wykonaj fetch/axios, obsłuż Promise, setInputDisabled(true/false)
    setStatus('loading');
    setError(null);
    setResult(null);

    console.log(`Symulacja wywołania API: ${attrs.method} ${attrs.apiUrl}`);
    console.log("Payload:", payload);
    console.log("Nagłówki:", attrs.headers); // UWAGA: Nigdy nie loguj wrażliwych nagłówków w produkcji!

    // Symulacja opóźnienia sieciowego
    const timeoutId = setTimeout(() => {
      // Symulacja odpowiedzi sukcesu lub błędu (np. 50% szans na błąd)
      if (Math.random() > 0.5) {
        // Symulacja sukcesu
        const mockSuccessResponse = {
            // Przykładowa odpowiedź z Facebook API (może się różnić!)
            id: `campaign_${Date.now()}`,
            status: "CREATED"
        };
        setStatus('success');
        // Mapowanie wyniku zgodnie z konfiguracją
        const successData = attrs.resultMapping?.successPath
            ? mockSuccessResponse[attrs.resultMapping.successPath] // Uproszczone - wymagałoby obsługi zagnieżdżonych ścieżek
            : mockSuccessResponse;
        setResult(successData);
        if (node.contextPath) {
            updateContext(node.contextPath, successData); // Zaktualizuj kontekst wynikiem
        }
         // addMessage({ type: 'assistant', content: `Kampania utworzona pomyślnie! ID: ${mockSuccessResponse.id}` });
      } else {
        // Symulacja błędu
         const mockErrorResponse = {
            error: {
                message: "Wystąpił błąd podczas tworzenia kampanii (symulacja)",
                code: 100
            }
         };
        setStatus('error');
         // Mapowanie błędu zgodnie z konfiguracją
        const errorData = attrs.resultMapping?.errorPath
             ? mockErrorResponse.error[attrs.resultMapping.errorPath] // Uproszczone
             : mockErrorResponse.error;
        setError(errorData);
         if (node.contextPath) {
            updateContext(node.contextPath, { error: errorData }); // Zaktualizuj kontekst błędem
        }
        // addMessage({ type: 'assistant', content: `Błąd: ${mockErrorResponse.error.message}` });
      }
      // setInputDisabled(false);
    }, 1500); // 1.5 sekundy opóźnienia

    return () => clearTimeout(timeoutId); // Cleanup
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node.id]); // Uruchom tylko raz przy zmianie ID węzła

  return (
    <div style={{ padding: '10px', border: '1px solid #eee', borderRadius: '4px', margin: '5px 0' }}>
      <p><strong>{node.label || 'Wywołanie API'}</strong></p>
      {node.assistantMessage && <p>{node.assistantMessage}</p>}
      {status === 'loading' && <p><i>Wykonywanie zapytania do {attrs.apiUrl}...</i></p>}
      {status === 'success' && (
        <div style={{ color: 'green' }}>
          <p>Sukces!</p>
          {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
        </div>
      )}
      {status === 'error' && (
        <div style={{ color: 'red' }}>
          <p>Błąd:</p>
          {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
        </div>
      )}
       {/* Można dodać przycisk "Ponów" itp. */}
    </div>
  );
};

export default ApiCallTemplate;