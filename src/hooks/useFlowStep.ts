// src/hooks/useFlowStep.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { NodeData, FormField } from '@/types';
import { useAuth } from './useAuth';
import { useAppStore } from '@/useAppStore';
import { extractJsonFromContent } from '@/utils';

export function useFlowStep({ 
  node, 
  onSubmit, 
  onPrevious, 
  isFirstNode, 
  isLastNode 
}: {
  node: NodeData;
  onSubmit: (data: any) => void;
  onPrevious: () => void;
  isFirstNode: boolean;
  isLastNode: boolean;
}) {
  // Obsługa nawigacji
  const handlePrevious = () => onPrevious();
  const handleComplete = (data: any) => onSubmit(data);

  // Część dla formularzy
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [formFields, setFormFields] = useState<FormField[]>([]);

  // Referencje dla LLM
  const autoStartExecutedRef = useRef(false);
  const isMountedRef = useRef(true);
  const autoCompleteExecutedRef = useRef(false);
  
  // Stan dla części LLM
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [responseData, setResponseData] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [schema, setSchema] = useState<any>(null);

  // Pobieranie danych kontekstowych
  const { 
    processTemplate, 
    getContextPath, 
    updateContextPath 
  } = useAppStore();
  
  const { getToken, user } = useAuth();

  // Przetworzony tekst asystenta
  const processedAssistantMessage = node.assistantMessage 
    ? processTemplate(node.assistantMessage) 
    : '';

  // Ustaw referencję zamontowania i resetuj stan autostartu przy zmianie node
  useEffect(() => {
    isMountedRef.current = true;
    autoStartExecutedRef.current = false;
    autoCompleteExecutedRef.current = false;
    
    return () => {
      isMountedRef.current = false;
    };
  }, [node.id, node.template]);

  // Pobieranie pól formularza ze schematu
  useEffect(() => {
    const attrs = node.attrs || {};
    if (!attrs.schemaPath) {
      setFormFields([]);
      return;
    }

    try {
      // Pobierz schemat z kontekstu
      const schemaData = getContextPath(attrs.schemaPath);
      
      if (!schemaData) {
        setFormFields([]);
        return;
      }

      // Jeśli dane są już tablicą pól formularza, użyj ich bezpośrednio
      if (Array.isArray(schemaData)) {
        setFormFields(schemaData);
        return;
      }
      
      // W przeciwnym razie sprawdź czy obiekt schemaData to właściwy schemat formularza
      setFormFields(Array.isArray(schemaData) ? schemaData : []);
    } catch (err) {
      console.error(`[useFlowStep] Error processing form schema:`, err);
      setFormFields([]);
    }
  }, [node.attrs, getContextPath]);

  // Pobieranie schematu dla LLM
  useEffect(() => {
    if (node.attrs?.schemaPath) {
      try {
        const schemaData = getContextPath(node.attrs.schemaPath);
        setSchema(schemaData);
      } catch (err) {
        setError(`Error getting schema: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [node.attrs?.schemaPath, getContextPath]);

  // Obsługa zmian w formularzu
  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Sprawdzenie czy wymagane pola są wypełnione
  const areRequiredFieldsFilled = () => {
    return formFields.every(
      field => !field.required || 
      (formData[field.name] !== undefined && formData[field.name] !== '')
    );
  };
  
  // Obsługa potwierdzenia formularza
  const handleSubmit = (e?: React.FormEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    if (node.contextPath) {
      const basePath = node.contextPath;
      Object.entries(formData).forEach(([key, value]) => {
        updateContextPath(`${basePath}.${key}`, value);
      });
    }
    
    handleComplete(formData);
    return formData;
  };

  // Wysłanie wiadomości do LLM
  const sendMessage = useCallback(async (message: string) => {
    try {
      if (!message.trim()) return null;

      setIsLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authorization token unavailable. Please login again.");
      }

      if (!user) {
        throw new Error("User not logged in. Please login again.");
      }

      // Przygotuj wiadomości
      const messages = [];

      // Dodaj wiadomość systemową jeśli wymagana
      if (node.attrs?.systemMessage) {
        messages.push({
          role: 'system',
          content: node.attrs.systemMessage,
        });
      }

      // Dodaj wiadomość inicjalizacyjną i odpowiedź asystenta
      if (node.attrs?.initialUserMessage) {
        const initialMessage = processTemplate(node.attrs.initialUserMessage);
        
        let initialContent = initialMessage;
        if (schema && !initialContent.includes('```json')) {
          initialContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(
            schema,
            null,
            2
          )}\n\`\`\``;
        }

        messages.push({
          role: 'user',
          content: initialContent,
        });

        if (processedAssistantMessage) {
          messages.push({
            role: 'assistant',
            content: processedAssistantMessage,
          });
        }
      }

      // Dodaj aktualną wiadomość użytkownika
      let userContent = message;
      if (schema && !userContent.includes('```json')) {
        userContent += `\n\nUse the following JSON schema:\n\`\`\`json\n${JSON.stringify(
          schema,
          null,
          2
        )}\n\`\`\``;
      }

      messages.push({
        role: 'user',
        content: userContent,
      });

      // Przygotuj payload do API
      const payload = {
        messages: messages,
        userId: user.uid,
      };
      
      // Ustaw informacje debugowania
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/v1/services/gemini/chat/completion`;
      setDebugInfo(`Sending to: ${apiUrl}`);
      console.log("[useFlowStep:LLM] Sending request to API:", apiUrl);

      // Wywołaj API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Sprawdź czy komponent jest nadal zamontowany
      if (!isMountedRef.current) return null;

      // Obsłuż błędy API
      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorData = JSON.parse(errorText);
          throw new Error(errorData.error?.message || `API request failed: ${response.status}`);
        } catch {
          throw new Error(`API request failed: ${response.status}`);
        }
      }

      // Przetwórz odpowiedź
      const apiResponseData = await response.json();
      console.log("[useFlowStep:LLM] API response received:", apiResponseData);
      
      const content = apiResponseData?.success && apiResponseData?.data?.message?.content;
      
      if (!content) {
        throw new Error('Invalid API response format');
      }
      
      const data = extractJsonFromContent(content);
      console.log("[useFlowStep:LLM] Extracted data from response:", data);
      
      if (isMountedRef.current) {
        setResponseData(data);

        // Zapisz dane do kontekstu jeśli podano contextPath
        if (node.contextPath && data) {
          updateContextPath(node.contextPath, data);
        }
      }
      
      return data;
    } catch (err) {
      console.error('[useFlowStep:LLM] API error:', err);
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : String(err));
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [
    getToken,
    user,
    node.attrs?.systemMessage,
    node.attrs?.initialUserMessage,
    node.contextPath,
    processTemplate,
    processedAssistantMessage,
    schema,
    updateContextPath
  ]);

  // KLUCZOWA ZMIANA: Obsługa autostartu dla LLM - dodane console.log do debugowania
  useEffect(() => {
    const handleAutoStart = async () => {
      if (
        node.template === 'llm-step' && 
        node.attrs?.autoStart === true && 
        !autoStartExecutedRef.current && 
        !isLoading && 
        !responseData && 
        !error
      ) {
        console.log(`[useFlowStep:LLM] Starting auto-start for node: ${node.id}, type: ${node.template}`);
        // Ustaw flagę przed wysłaniem, aby uniknąć duplikacji wywołań
        autoStartExecutedRef.current = true;
        
        const initialMessage = node.attrs?.initialUserMessage || '';
        if (initialMessage) {
          console.log(`[useFlowStep:LLM] Sending initial message: ${initialMessage.substring(0, 50)}...`);
          const processedMessage = processTemplate(initialMessage);
          await sendMessage(processedMessage);
          console.log(`[useFlowStep:LLM] Auto-start message sent`);
        } else {
          console.log(`[useFlowStep:LLM] No initial message to send`);
        }
      }
    };

    if (node.template === 'llm-step') {
      console.log(`[useFlowStep:LLM] LLM step detected: ${node.id}, autoStart:`, 
        node.attrs?.autoStart,
        'autoStartExecuted:', autoStartExecutedRef.current,
        'isLoading:', isLoading,
        'responseData:', Boolean(responseData),
        'error:', Boolean(error)
      );
    }

    handleAutoStart();
  }, [
    node.template,
    node.id,
    node.attrs?.autoStart,
    node.attrs?.initialUserMessage,
    isLoading,
    responseData,
    error,
    processTemplate,
    sendMessage
  ]);

  // BLOKOWANIE AUTO-COMPLETE: Nigdy nie wywołuj automatycznego przejścia do następnego kroku
  // Wróć ręczny wybór użytkownika w LlmStepTemplate.tsx

  return {
    // Właściwości wspólne
    isLoading,
    error,
    processedAssistantMessage,
    handlePrevious,
    handleComplete,
    
    // Właściwości formularza
    formData,
    formFields,
    handleChange,
    handleSubmit,
    areRequiredFieldsFilled,
    
    // Właściwości LLM
    responseData,
    sendMessage,
    schema,
    debugInfo
  };
}